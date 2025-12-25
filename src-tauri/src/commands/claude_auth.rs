use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;
use crate::claude_binary::find_claude_binary;

// Claude Code CLI가 사용하는 Keychain 서비스명 (OAuth 토큰 저장)
const CLAUDE_CODE_KEYCHAIN_SERVICE: &str = "Claude Code-credentials";
// Legacy Claude Safe Storage (구버전 호환용)
const CLAUDE_LEGACY_SERVICE: &str = "Claude Safe Storage";
const CLAUDE_LEGACY_ACCOUNT: &str = "Claude Key";

// ANYON 앱 전용 Keychain 서비스명 (API 키 저장)
const ANYON_SERVICE_NAME: &str = "anyon-claude";
const API_KEY_ACCOUNT: &str = "anthropic_api_key";

// macOS/Linux에서 시도할 계정 이름 목록 (사용자명 → default 순서)
fn get_account_candidates() -> Vec<String> {
    let username = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .unwrap_or_else(|_| "default".to_string());

    if username == "default" {
        vec!["default".to_string()]
    } else {
        vec![username, "default".to_string()]
    }
}

// Windows에서 시도할 Credential Manager 계정 이름들
#[cfg(target_os = "windows")]
fn get_windows_account_candidates() -> Vec<String> {
    let username = std::env::var("USERNAME").unwrap_or_else(|_| "default".to_string());
    vec![username, "default".to_string(), "claude".to_string(), "Claude Code".to_string(), "claude-code".to_string()]
}

// ============================================================
// 데이터 구조
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeAuthStatus {
    /// 인증 여부
    pub is_authenticated: bool,
    /// 인증 방식: "oauth" | "api_key" | "none"
    pub auth_method: String,
    /// 구독 타입: "free" | "pro" | "max" | null
    pub subscription_type: Option<String>,
    /// 토큰 만료 시간 (Unix timestamp ms)
    pub expires_at: Option<i64>,
    /// 토큰 만료 여부
    pub is_expired: bool,
    /// 표시용 정보
    pub display_info: Option<String>,
    /// 에러 메시지 (있으면)
    pub error: Option<String>,
    /// 플랫폼별 추가 정보
    pub platform_note: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ClaudeCredentials {
    #[serde(rename = "claudeAiOauth")]
    claude_ai_oauth: Option<OAuthCredentials>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct OAuthCredentials {
    #[serde(rename = "accessToken")]
    access_token: String,
    #[serde(rename = "refreshToken")]
    refresh_token: String,
    #[serde(rename = "expiresAt")]
    expires_at: i64,
    #[serde(default)]
    scopes: Option<Vec<String>>,
    #[serde(rename = "subscriptionType")]
    subscription_type: Option<String>,
    #[serde(rename = "rateLimitTier")]
    rate_limit_tier: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyValidationResult {
    pub valid: bool,
    pub error: Option<String>,
}

// ============================================================
// 핵심: Claude Code 인증 상태 확인
// ============================================================

/// Claude Code의 기존 인증 상태를 확인
/// Note: _app_handle은 현재 사용하지 않지만 향후 확장을 위해 유지
#[tauri::command]
pub async fn claude_auth_check(_app_handle: tauri::AppHandle) -> Result<ClaudeAuthStatus, String> {
    // 1. 먼저 우리가 저장한 API 키가 있는지 확인
    match get_stored_api_key() {
        Ok(Some(_)) => {
            return Ok(ClaudeAuthStatus {
                is_authenticated: true,
                auth_method: "api_key".to_string(),
                subscription_type: None,
                expires_at: None,
                is_expired: false,
                display_info: Some("API 키로 연결됨".to_string()),
                error: None,
                platform_note: None,
            });
        }
        Ok(None) => {}
        Err(e) => {
            log::warn!("API 키 확인 실패: {}", e);
        }
    }

    // 2. Claude Code OAuth 토큰 확인
    match read_claude_credentials() {
        Ok((credentials, platform_note)) => {
            match credentials.claude_ai_oauth {
                Some(oauth) => {
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_millis() as i64)
                        .unwrap_or(0);

                    let is_expired = oauth.expires_at < now;

                    let display_info = oauth.subscription_type.as_ref().map(|t| {
                        match t.as_str() {
                            "max" => "Claude Max".to_string(),
                            "pro" => "Claude Pro".to_string(),
                            "free" => "무료 플랜".to_string(),
                            other => other.to_string(),
                        }
                    });

                    Ok(ClaudeAuthStatus {
                        is_authenticated: !is_expired,
                        auth_method: "oauth".to_string(),
                        subscription_type: oauth.subscription_type,
                        expires_at: Some(oauth.expires_at),
                        is_expired,
                        display_info,
                        error: None,
                        platform_note,
                    })
                }
                None => Ok(ClaudeAuthStatus {
                    is_authenticated: false,
                    auth_method: "none".to_string(),
                    subscription_type: None,
                    expires_at: None,
                    is_expired: false,
                    display_info: None,
                    error: None,
                    platform_note,
                }),
            }
        }
        Err(e) => {
            // Keychain/Credential Manager 접근 실패 등은 "인증 안됨"으로 처리
            log::warn!("Credentials 읽기 실패: {}", e);
            Ok(ClaudeAuthStatus {
                is_authenticated: false,
                auth_method: "none".to_string(),
                subscription_type: None,
                expires_at: None,
                is_expired: false,
                display_info: None,
                error: Some(e),
                platform_note: None,
            })
        }
    }
}

/// 플랫폼별 Claude credentials 읽기
/// Returns: (credentials, optional_platform_note)
fn read_claude_credentials() -> Result<(ClaudeCredentials, Option<String>), String> {
    #[cfg(target_os = "macos")]
    {
        read_credentials_macos()
    }

    #[cfg(target_os = "linux")]
    {
        read_credentials_linux()
    }

    #[cfg(target_os = "windows")]
    {
        read_credentials_windows()
    }
}

// ============================================================
// macOS: Keychain에서 credentials 읽기
// ============================================================

/// Keychain에서 특정 서비스/계정의 credentials 조회 시도
#[cfg(target_os = "macos")]
fn try_keychain_lookup(service: &str, account: &str) -> Option<ClaudeCredentials> {
    let output = Command::new("security")
        .args(["find-generic-password", "-s", service, "-a", account, "-w"])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(json_str.trim()).ok()
}

#[cfg(target_os = "macos")]
fn read_credentials_macos() -> Result<(ClaudeCredentials, Option<String>), String> {
    // 1차: Claude Code-credentials + 현재 사용자명 / default
    for account in get_account_candidates() {
        if let Some(creds) = try_keychain_lookup(CLAUDE_CODE_KEYCHAIN_SERVICE, &account) {
            log::info!("Found credentials: service={}, account={}", CLAUDE_CODE_KEYCHAIN_SERVICE, account);
            return Ok((creds, Some(format!("Keychain (account: {})", account))));
        }
    }

    // 2차: Legacy Claude Safe Storage
    if let Some(creds) = try_keychain_lookup(CLAUDE_LEGACY_SERVICE, CLAUDE_LEGACY_ACCOUNT) {
        log::info!("Found credentials: service={} (legacy)", CLAUDE_LEGACY_SERVICE);
        return Ok((creds, Some("Keychain (legacy)".to_string())));
    }

    // 인증 정보 없음
    log::info!("No Claude credentials found in Keychain");
    Ok((ClaudeCredentials { claude_ai_oauth: None }, None))
}

// ============================================================
// Linux: 파일에서 credentials 읽기 (secret-tool fallback)
// ============================================================

#[cfg(target_os = "linux")]
fn read_credentials_linux() -> Result<(ClaudeCredentials, Option<String>), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let creds_path = home.join(".claude").join(".credentials.json");

    // 1순위: 파일에서 읽기 (~/.claude/.credentials.json)
    if creds_path.exists() {
        let content = fs::read_to_string(&creds_path)
            .map_err(|e| format!("Credentials 파일 읽기 실패: {}", e))?;

        let credentials = serde_json::from_str(&content)
            .map_err(|e| format!("Credentials JSON 파싱 실패: {}", e))?;

        log::info!("Found credentials in file: {:?}", creds_path);
        return Ok((credentials, Some("파일에서 읽음".to_string())));
    }

    // 2순위: secret-tool 시도 (GNOME Secret Service)
    // Claude Code-credentials 서비스를 먼저 시도
    let services_to_try = vec![CLAUDE_CODE_KEYCHAIN_SERVICE, CLAUDE_LEGACY_SERVICE];

    for service in services_to_try {
        if let Ok(output) = Command::new("secret-tool")
            .args(["lookup", "service", service])
            .output()
        {
            if output.status.success() {
                let json_str = String::from_utf8_lossy(&output.stdout);
                if !json_str.trim().is_empty() {
                    if let Ok(credentials) = serde_json::from_str(json_str.trim()) {
                        log::info!("Found credentials via secret-tool: service={}", service);
                        return Ok((credentials, Some(format!("secret-tool ({})", service))));
                    }
                }
            }
        }
    }

    // 3순위: 둘 다 없음 - secret-tool 미설치 안내
    let has_secret_tool = Command::new("which")
        .arg("secret-tool")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    let note = if !has_secret_tool {
        Some("secret-tool이 설치되어 있지 않습니다. GNOME 환경이 아닌 경우 ~/.claude/.credentials.json 파일이 필요합니다.".to_string())
    } else {
        None
    };

    log::info!("No Claude credentials found on Linux");
    Ok((ClaudeCredentials { claude_ai_oauth: None }, note))
}

// ============================================================
// Windows: Credential Manager + 파일 fallback
// ============================================================

#[cfg(target_os = "windows")]
fn read_credentials_windows() -> Result<(ClaudeCredentials, Option<String>), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    // 1순위: 파일에서 읽기 (%USERPROFILE%\.claude\.credentials.json)
    let creds_path = home.join(".claude").join(".credentials.json");
    if creds_path.exists() {
        let content = fs::read_to_string(&creds_path)
            .map_err(|e| format!("Credentials 파일 읽기 실패: {}", e))?;

        let credentials = serde_json::from_str(&content)
            .map_err(|e| format!("Credentials JSON 파싱 실패: {}", e))?;

        log::info!("Found credentials in file: {:?}", creds_path);
        return Ok((credentials, Some("파일에서 읽음".to_string())));
    }

    // 2순위: Credential Manager에서 읽기
    // Claude Code-credentials 서비스를 먼저 시도, 그 다음 legacy 서비스
    let services_to_try = vec![CLAUDE_CODE_KEYCHAIN_SERVICE, CLAUDE_LEGACY_SERVICE];

    for service in &services_to_try {
        for account in get_windows_account_candidates() {
            if let Ok(entry) = keyring::Entry::new(service, &account) {
                if let Ok(password) = entry.get_password() {
                    match serde_json::from_str::<ClaudeCredentials>(&password) {
                        Ok(credentials) => {
                            let note = format!("Credential Manager (service: {}, account: {})", service, account);
                            log::info!("Found credentials: {}", note);
                            return Ok((credentials, Some(note)));
                        }
                        Err(e) => {
                            log::debug!("Credential Manager JSON 파싱 실패 (service: {}, account: {}): {}", service, account, e);
                        }
                    }
                }
            }
        }
    }

    // 3순위: 둘 다 없음
    log::info!("No Claude credentials found on Windows");
    Ok((
        ClaudeCredentials { claude_ai_oauth: None },
        Some("Windows Credential Manager에서 Claude 인증 정보를 찾지 못했습니다. 터미널에서 /login을 실행하거나 API 키를 사용해주세요.".to_string())
    ))
}

// ============================================================
// 터미널에서 로그인 유도
// ============================================================

/// 터미널을 열고 `claude login` 실행
/// 기존 claude_binary 모듈의 find_claude_binary 활용
#[tauri::command]
pub async fn claude_auth_open_terminal(app_handle: tauri::AppHandle) -> Result<(), String> {
    // 1. Claude binary 경로 확인
    let claude_path = find_claude_binary(&app_handle)
        .map_err(|e| format!("Claude Code CLI를 찾을 수 없습니다: {}. Claude Code가 설치되어 있는지 확인해주세요.", e))?;

    log::info!("Found Claude binary at: {}", claude_path);

    // 2. 터미널에서 로그인 명령 실행
    open_terminal_with_login(&claude_path)
}

#[cfg(target_os = "macos")]
fn open_terminal_with_login(claude_path: &str) -> Result<(), String> {
    // 경로에 공백/특수문자가 있을 수 있으므로 따옴표로 감싸고 이스케이프
    let escaped_path = claude_path
        .replace("\\", "\\\\")
        .replace("\"", "\\\"");

    // Claude Code를 시작하고 /login을 입력하라는 안내 메시지 표시
    // 터미널에서 claude를 실행하고 사용자가 /login을 입력하도록 유도
    let script = format!(
        r#"tell application "Terminal"
            activate
            do script "echo '\\n🔑 Claude Code 로그인\\n터미널에서 /login 을 입력하세요\\n' && \"{}\""
        end tell"#,
        escaped_path
    );

    Command::new("osascript")
        .args(["-e", &script])
        .spawn()
        .map_err(|e| format!("터미널 열기 실패: {}", e))?;

    Ok(())
}

#[cfg(target_os = "linux")]
fn open_terminal_with_login(claude_path: &str) -> Result<(), String> {
    // Claude Code를 시작하고 /login 안내 메시지 표시
    let login_cmd = format!("echo -e '\\n🔑 Claude Code 로그인\\n터미널에서 /login 을 입력하세요\\n' && '{}'; exec bash", claude_path);

    // 여러 터미널 에뮬레이터 시도
    let terminals: Vec<(&str, Vec<String>)> = vec![
        ("gnome-terminal", vec!["--".to_string(), "bash".to_string(), "-c".to_string(), login_cmd.clone()]),
        ("konsole", vec!["-e".to_string(), "bash".to_string(), "-c".to_string(), login_cmd.clone()]),
        ("xfce4-terminal", vec!["-e".to_string(), format!("bash -c \"{}\"", login_cmd)]),
        ("xterm", vec!["-e".to_string(), "bash".to_string(), "-c".to_string(), login_cmd.clone()]),
    ];

    for (terminal, args) in &terminals {
        if Command::new(terminal)
            .args(args)
            .spawn()
            .is_ok()
        {
            log::info!("터미널 열림: {}", terminal);
            return Ok(());
        }
    }

    Err("터미널을 찾을 수 없습니다. gnome-terminal, konsole, xfce4-terminal 또는 xterm을 설치해주세요.".to_string())
}

#[cfg(target_os = "windows")]
fn open_terminal_with_login(claude_path: &str) -> Result<(), String> {
    // Windows: cmd를 열고 Claude Code 시작 + /login 안내
    let cmd_arg = format!(
        "echo. & echo 🔑 Claude Code 로그인 & echo 터미널에서 /login 을 입력하세요 & echo. & \"{}\"",
        claude_path
    );

    Command::new("cmd")
        .args(["/c", "start", "cmd", "/k", &cmd_arg])
        .spawn()
        .map_err(|e| format!("터미널 열기 실패: {}", e))?;

    Ok(())
}

// ============================================================
// API 키 관련 (대안)
// ============================================================

/// Keychain/Credential Manager에서 저장된 API 키 확인
fn get_stored_api_key() -> Result<Option<String>, String> {
    let entry = keyring::Entry::new(ANYON_SERVICE_NAME, API_KEY_ACCOUNT)
        .map_err(|e| format!("Keyring Entry 생성 실패: {}", e))?;

    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Keyring 읽기 실패: {}", e)),
    }
}

/// API 키 저장 및 apiKeyHelper 스크립트 설정
/// 다른 인증 방법(ANYON API)을 자동으로 제거합니다
#[tauri::command]
pub async fn claude_auth_save_api_key(api_key: String) -> Result<(), String> {
    // 1. 형식 검증
    if !api_key.starts_with("sk-ant-") {
        return Err("API 키는 'sk-ant-'로 시작해야 합니다.".to_string());
    }

    // 2. ANYON API 설정 제거 (상호 배타적)
    if let Err(e) = claude_auth_disable_anyon_api().await {
        log::warn!("ANYON API 비활성화 실패 (무시): {}", e);
    }

    // 3. Keychain/Credential Manager에 저장
    let entry = keyring::Entry::new(ANYON_SERVICE_NAME, API_KEY_ACCOUNT)
        .map_err(|e| format!("Keyring Entry 생성 실패: {}", e))?;

    entry.set_password(&api_key)
        .map_err(|e| format!("API 키 저장 실패: {}", e))?;

    // 3. apiKeyHelper 스크립트 생성 (Windows는 스킵하고 안내 메시지만)
    #[cfg(not(target_os = "windows"))]
    {
        create_api_key_helper_script()?;
        update_claude_settings_api_key_helper()?;
    }

    #[cfg(target_os = "windows")]
    {
        log::info!("Windows에서는 API Key Helper 스크립트가 지원되지 않습니다. Keychain에만 저장됩니다.");
    }

    log::info!("API 키가 저장되었습니다.");
    Ok(())
}

/// API 키 삭제
#[tauri::command]
pub async fn claude_auth_delete_api_key() -> Result<(), String> {
    // 1. Keychain/Credential Manager에서 삭제
    let entry = keyring::Entry::new(ANYON_SERVICE_NAME, API_KEY_ACCOUNT)
        .map_err(|e| format!("Keyring Entry 생성 실패: {}", e))?;

    match entry.delete_password() {
        Ok(()) => {}
        Err(keyring::Error::NoEntry) => {} // 이미 없음
        Err(e) => return Err(format!("API 키 삭제 실패: {}", e)),
    }

    // 2. Helper 스크립트 삭제 (Unix only)
    #[cfg(not(target_os = "windows"))]
    {
        delete_api_key_helper()?;
    }

    log::info!("API 키가 삭제되었습니다.");
    Ok(())
}

/// API 키 유효성 검증 (Anthropic API 호출)
#[tauri::command]
pub async fn claude_auth_validate_api_key(api_key: String) -> Result<ApiKeyValidationResult, String> {
    if !api_key.starts_with("sk-ant-") {
        return Ok(ApiKeyValidationResult {
            valid: false,
            error: Some("API 키 형식이 올바르지 않습니다. 'sk-ant-'로 시작해야 합니다.".to_string()),
        });
    }

    let client = reqwest::Client::new();
    let response = client
        .get("https://api.anthropic.com/v1/models")
        .header("x-api-key", &api_key)
        .header("anthropic-version", "2023-06-01")
        .send()
        .await
        .map_err(|e| format!("API 호출 실패: {}", e))?;

    match response.status().as_u16() {
        200 => Ok(ApiKeyValidationResult { valid: true, error: None }),
        401 => Ok(ApiKeyValidationResult {
            valid: false,
            error: Some("API 키가 유효하지 않습니다.".to_string()),
        }),
        403 => Ok(ApiKeyValidationResult {
            valid: false,
            error: Some("API 키가 비활성화되었거나 권한이 없습니다.".to_string()),
        }),
        429 => Ok(ApiKeyValidationResult {
            valid: false,
            error: Some("요청 한도 초과 또는 크레딧이 부족합니다.".to_string()),
        }),
        status => Ok(ApiKeyValidationResult {
            valid: false,
            error: Some(format!("알 수 없는 오류 (HTTP {})", status)),
        }),
    }
}

// ============================================================
// Helper Functions (Unix only)
// ============================================================

/// apiKeyHelper 스크립트 생성 (macOS/Linux only)
#[cfg(not(target_os = "windows"))]
fn create_api_key_helper_script() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let claude_dir = home.join(".claude");
    fs::create_dir_all(&claude_dir)
        .map_err(|e| format!("~/.claude 디렉토리 생성 실패: {}", e))?;

    let script_path = claude_dir.join("anyon_api_key_helper.sh");

    #[cfg(target_os = "macos")]
    let content = format!(
        "#!/bin/bash\nsecurity find-generic-password -s \"{}\" -a \"{}\" -w 2>/dev/null\n",
        ANYON_SERVICE_NAME, API_KEY_ACCOUNT
    );

    #[cfg(target_os = "linux")]
    let content = format!(
        "#!/bin/bash\nsecret-tool lookup service \"{}\" account \"{}\" 2>/dev/null || keyring get \"{}\" \"{}\"\n",
        ANYON_SERVICE_NAME, API_KEY_ACCOUNT, ANYON_SERVICE_NAME, API_KEY_ACCOUNT
    );

    fs::write(&script_path, content)
        .map_err(|e| format!("스크립트 파일 생성 실패: {}", e))?;

    // 실행 권한 설정
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&script_path)
            .map_err(|e| format!("파일 메타데이터 조회 실패: {}", e))?
            .permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&script_path, perms)
            .map_err(|e| format!("실행 권한 설정 실패: {}", e))?;
    }

    log::info!("API Key Helper 스크립트 생성: {:?}", script_path);
    Ok(())
}

/// Claude settings.local.json에 apiKeyHelper 설정 추가 (기존 설정 유지하며 병합)
#[cfg(not(target_os = "windows"))]
fn update_claude_settings_api_key_helper() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let settings_path = home.join(".claude").join("settings.local.json");
    let script_path = home.join(".claude").join("anyon_api_key_helper.sh");

    // 기존 설정 읽기 (없으면 빈 객체)
    let mut settings: serde_json::Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("settings.local.json 읽기 실패: {}", e))?;
        serde_json::from_str(&content).unwrap_or(serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    // apiKeyHelper만 추가/업데이트 (다른 설정은 유지)
    if let Some(obj) = settings.as_object_mut() {
        obj.insert(
            "apiKeyHelper".to_string(),
            serde_json::Value::String(script_path.to_string_lossy().to_string())
        );
    }

    // 저장
    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("JSON 직렬화 실패: {}", e))?;

    fs::write(&settings_path, content)
        .map_err(|e| format!("settings.local.json 저장 실패: {}", e))?;

    log::info!("settings.local.json에 apiKeyHelper 설정 추가");
    Ok(())
}

// ============================================================
// Claude OAuth 로그아웃
// ============================================================

/// Claude OAuth 로그아웃 (Keychain/Credential Manager에서 credentials 삭제)
#[tauri::command]
pub async fn claude_auth_logout() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        logout_macos()?;
    }

    #[cfg(target_os = "linux")]
    {
        logout_linux()?;
    }

    #[cfg(target_os = "windows")]
    {
        logout_windows()?;
    }

    log::info!("Claude OAuth 로그아웃 완료");
    Ok(())
}

/// macOS: Keychain에서 Claude credentials 삭제
#[cfg(target_os = "macos")]
fn logout_macos() -> Result<(), String> {
    let mut deleted_any = false;

    // Claude Code-credentials 서비스 삭제 (모든 계정 후보)
    for account in get_account_candidates() {
        let output = Command::new("security")
            .args(["delete-generic-password", "-s", CLAUDE_CODE_KEYCHAIN_SERVICE, "-a", &account])
            .output();

        if let Ok(out) = output {
            if out.status.success() {
                log::info!("Deleted credentials: service={}, account={}", CLAUDE_CODE_KEYCHAIN_SERVICE, account);
                deleted_any = true;
            }
        }
    }

    // Legacy 서비스도 삭제 시도
    let output = Command::new("security")
        .args(["delete-generic-password", "-s", CLAUDE_LEGACY_SERVICE, "-a", CLAUDE_LEGACY_ACCOUNT])
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            log::info!("Deleted legacy credentials: service={}", CLAUDE_LEGACY_SERVICE);
            deleted_any = true;
        }
    }

    if deleted_any {
        log::info!("macOS Keychain에서 Claude credentials 삭제 완료");
    } else {
        log::info!("Keychain에 Claude credentials 없음 (이미 로그아웃 상태)");
    }

    Ok(())
}

/// Linux: secret-tool + 파일 삭제
#[cfg(target_os = "linux")]
fn logout_linux() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    // 1. ~/.claude/.credentials.json 파일 삭제
    let creds_path = home.join(".claude").join(".credentials.json");
    if creds_path.exists() {
        fs::remove_file(&creds_path)
            .map_err(|e| format!("credentials 파일 삭제 실패: {}", e))?;
        log::info!("~/.claude/.credentials.json 삭제 완료");
    }

    // 2. secret-tool에서 삭제 시도 (GNOME 환경) - 모든 서비스 삭제
    for service in &[CLAUDE_CODE_KEYCHAIN_SERVICE, CLAUDE_LEGACY_SERVICE] {
        if let Ok(output) = Command::new("secret-tool")
            .args(["clear", "service", service])
            .output()
        {
            if output.status.success() {
                log::info!("secret-tool에서 삭제 완료: service={}", service);
            }
        }
    }

    Ok(())
}

/// Windows: Credential Manager + 파일 삭제
#[cfg(target_os = "windows")]
fn logout_windows() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    // 1. credentials 파일 삭제
    let creds_path = home.join(".claude").join(".credentials.json");
    if creds_path.exists() {
        fs::remove_file(&creds_path)
            .map_err(|e| format!("credentials 파일 삭제 실패: {}", e))?;
        log::info!("credentials 파일 삭제 완료");
    }

    // 2. Credential Manager에서 삭제 (모든 서비스 및 계정 후보)
    let services_to_try = vec![CLAUDE_CODE_KEYCHAIN_SERVICE, CLAUDE_LEGACY_SERVICE];

    for service in &services_to_try {
        for account in get_windows_account_candidates() {
            if let Ok(entry) = keyring::Entry::new(service, &account) {
                match entry.delete_password() {
                    Ok(()) => {
                        log::info!("Windows Credential Manager에서 삭제 완료 (service: {}, account: {})", service, account);
                    }
                    Err(keyring::Error::NoEntry) => {}
                    Err(e) => {
                        log::debug!("Credential Manager 삭제 실패 (service: {}, account: {}): {}", service, account, e);
                    }
                }
            }
        }
    }

    Ok(())
}

// ============================================================
// ANYON API Mode (서버 프록시 사용)
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnyonApiConfig {
    /// ANYON 서버 URL
    pub server_url: String,
    /// 사용자 JWT 토큰
    pub jwt_token: String,
}

/// ANYON API 모드 활성화
/// Claude Code가 ANYON 서버 프록시를 통해 API를 사용하도록 설정
/// 다른 인증 방법(API Key)을 자동으로 제거합니다
#[tauri::command]
pub async fn claude_auth_enable_anyon_api(config: AnyonApiConfig) -> Result<(), String> {
    // 1. Keychain에서 API Key 제거 (상호 배타적)
    if let Err(e) = claude_auth_delete_api_key().await {
        log::warn!("API Key 제거 실패 (무시): {}", e);
    }

    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let claude_dir = home.join(".claude");
    fs::create_dir_all(&claude_dir)
        .map_err(|e| format!("~/.claude 디렉토리 생성 실패: {}", e))?;

    let settings_path = claude_dir.join("settings.local.json");

    // 기존 설정 읽기
    let mut settings: serde_json::Value = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("settings.local.json 읽기 실패: {}", e))?;
        serde_json::from_str(&content).unwrap_or(serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    // env 객체 가져오거나 생성
    let env = settings
        .as_object_mut()
        .ok_or("설정이 객체가 아닙니다.")?
        .entry("env")
        .or_insert(serde_json::json!({}))
        .as_object_mut()
        .ok_or("env가 객체가 아닙니다.")?;

    // ANYON 프록시 설정 추가
    env.insert(
        "ANTHROPIC_BASE_URL".to_string(),
        serde_json::Value::String(config.server_url.clone())
    );
    env.insert(
        "ANTHROPIC_API_KEY".to_string(),
        serde_json::Value::String(config.jwt_token.clone())
    );

    // apiKeyHelper 제거 (ANYON API 모드에서는 사용 안 함)
    if let Some(obj) = settings.as_object_mut() {
        obj.remove("apiKeyHelper");
    }

    // 저장
    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("JSON 직렬화 실패: {}", e))?;

    fs::write(&settings_path, content)
        .map_err(|e| format!("settings.local.json 저장 실패: {}", e))?;

    log::info!("ANYON API 모드 활성화: {}", config.server_url);
    Ok(())
}

/// ANYON API 모드 비활성화
/// Claude Code 설정에서 ANYON 관련 환경변수 제거
#[tauri::command]
pub async fn claude_auth_disable_anyon_api() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let settings_path = home.join(".claude").join("settings.local.json");

    if !settings_path.exists() {
        return Ok(());
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("설정 파일 읽기 실패: {}", e))?;

    let mut settings: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("JSON 파싱 실패: {}", e))?;

    // env에서 ANYON 관련 설정 제거
    if let Some(env) = settings.get_mut("env").and_then(|e| e.as_object_mut()) {
        env.remove("ANTHROPIC_BASE_URL");
        env.remove("ANTHROPIC_API_KEY");

        // env가 비어있으면 전체 제거
        if env.is_empty() {
            if let Some(obj) = settings.as_object_mut() {
                obj.remove("env");
            }
        }
    }

    // 저장
    let content = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("JSON 직렬화 실패: {}", e))?;

    fs::write(&settings_path, content)
        .map_err(|e| format!("설정 파일 저장 실패: {}", e))?;

    log::info!("ANYON API 모드 비활성화");
    Ok(())
}

/// 현재 ANYON API 모드 상태 확인
#[tauri::command]
pub async fn claude_auth_get_anyon_api_status() -> Result<Option<String>, String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    let settings_path = home.join(".claude").join("settings.local.json");

    if !settings_path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("설정 파일 읽기 실패: {}", e))?;

    let settings: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("JSON 파싱 실패: {}", e))?;

    // ANTHROPIC_BASE_URL 확인
    if let Some(base_url) = settings
        .get("env")
        .and_then(|e| e.get("ANTHROPIC_BASE_URL"))
        .and_then(|v| v.as_str())
    {
        return Ok(Some(base_url.to_string()));
    }

    Ok(None)
}

/// Helper 스크립트 및 설정 제거 (macOS/Linux only)
#[cfg(not(target_os = "windows"))]
fn delete_api_key_helper() -> Result<(), String> {
    let home = dirs::home_dir()
        .ok_or("홈 디렉토리를 찾을 수 없습니다.")?;

    // 스크립트 삭제
    let script_path = home.join(".claude").join("anyon_api_key_helper.sh");
    if script_path.exists() {
        fs::remove_file(&script_path)
            .map_err(|e| format!("스크립트 삭제 실패: {}", e))?;
    }

    // settings.local.json에서 apiKeyHelper만 제거 (다른 설정 유지)
    let settings_path = home.join(".claude").join("settings.local.json");
    if settings_path.exists() {
        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("설정 파일 읽기 실패: {}", e))?;

        if let Ok(mut settings) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(obj) = settings.as_object_mut() {
                // anyon_api_key_helper.sh를 가리키는 경우에만 제거
                if let Some(helper_path) = obj.get("apiKeyHelper").and_then(|v| v.as_str()) {
                    if helper_path.contains("anyon_api_key_helper") {
                        obj.remove("apiKeyHelper");

                        let content = serde_json::to_string_pretty(&settings)
                            .map_err(|e| format!("JSON 직렬화 실패: {}", e))?;

                        fs::write(&settings_path, content)
                            .map_err(|e| format!("설정 파일 저장 실패: {}", e))?;
                    }
                }
            }
        }
    }

    Ok(())
}

// ============================================================
// 직접 OAuth 통합 (PKCE 방식)
// ============================================================

use sha2::{Sha256, Digest};
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use rand::Rng;
use tauri::Emitter;
use std::sync::atomic::{AtomicBool, Ordering};

// Claude OAuth 엔드포인트
// - Authorization: claude.ai (사용자 로그인 UI)
// - Token exchange: console.anthropic.com (API 백엔드)
const ANTHROPIC_AUTH_URL: &str = "https://claude.ai/oauth/authorize";
const ANTHROPIC_TOKEN_URL: &str = "https://console.anthropic.com/v1/oauth/token";
// Claude Code 공식 Client ID
const CLAUDE_CODE_CLIENT_ID: &str = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
// OAuth scopes (user:sessions:claude_code 필수!)
const OAUTH_SCOPES: &str = "org:create_api_key user:profile user:inference user:sessions:claude_code";

// 폴링 중단 플래그 (전역)
static POLL_STOP_FLAG: AtomicBool = AtomicBool::new(false);

/// PKCE code_verifier 생성 (43-128자 랜덤 문자열)
fn generate_code_verifier() -> String {
    let bytes: Vec<u8> = (0..32).map(|_| rand::thread_rng().gen()).collect();
    URL_SAFE_NO_PAD.encode(&bytes)
}

/// code_challenge 생성 (S256 해시)
fn generate_code_challenge(verifier: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    URL_SAFE_NO_PAD.encode(hasher.finalize())
}

/// OAuth 토큰 응답 구조체
#[derive(Debug, Deserialize)]
struct OAuthTokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    expires_in: Option<i64>,
    token_type: String,
    scope: Option<String>,
}

/// 직접 OAuth 플로우 시작 (브라우저에서 인증 후 콜백 수신)
#[tauri::command]
pub async fn claude_oauth_start(app_handle: tauri::AppHandle) -> Result<String, String> {
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use tokio::net::TcpListener;

    // 1. PKCE 생성
    let code_verifier = generate_code_verifier();
    let code_challenge = generate_code_challenge(&code_verifier);
    let state = uuid::Uuid::new_v4().to_string();

    // 2. 로컬 콜백 서버 시작 (랜덤 포트)
    let listener = TcpListener::bind("127.0.0.1:0").await
        .map_err(|e| format!("로컬 서버 시작 실패: {}", e))?;
    let port = listener.local_addr()
        .map_err(|e| format!("포트 확인 실패: {}", e))?
        .port();
    let redirect_uri = format!("http://localhost:{}/callback", port);

    log::info!("OAuth callback server started on port {}", port);

    // 3. Authorization URL 생성 (code=true 파라미터 필수!)
    let auth_url = format!(
        "{}?code=true&client_id={}&response_type=code&redirect_uri={}&state={}&code_challenge={}&code_challenge_method=S256&scope={}",
        ANTHROPIC_AUTH_URL,
        CLAUDE_CODE_CLIENT_ID,
        urlencoding::encode(&redirect_uri),
        &state,
        &code_challenge,
        urlencoding::encode(OAUTH_SCOPES)
    );

    // 4. 브라우저 열기
    if let Err(e) = open::that(&auth_url) {
        return Err(format!("브라우저 열기 실패: {}", e));
    }

    log::info!("Opened browser for OAuth: {}", auth_url);

    // 5. 콜백 대기 (별도 태스크에서 처리)
    let app = app_handle.clone();
    let verifier = code_verifier.clone();
    let expected_state = state.clone();
    let redirect = redirect_uri.clone();

    tokio::spawn(async move {
        // 5분 타임아웃
        let timeout = tokio::time::timeout(
            std::time::Duration::from_secs(300),
            handle_oauth_callback(listener, verifier, expected_state, redirect, app)
        ).await;

        match timeout {
            Ok(result) => {
                if let Err(e) = result {
                    log::error!("OAuth callback error: {}", e);
                }
            }
            Err(_) => {
                log::warn!("OAuth callback timeout");
            }
        }
    });

    Ok(auth_url)
}

/// OAuth 콜백 대기 및 토큰 교환
async fn handle_oauth_callback(
    listener: tokio::net::TcpListener,
    code_verifier: String,
    expected_state: String,
    redirect_uri: String,
    app_handle: tauri::AppHandle
) -> Result<(), String> {
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};

    // HTTP 요청 수신
    let (mut socket, _) = listener.accept().await
        .map_err(|e| format!("연결 수신 실패: {}", e))?;

    // 요청 읽기
    let mut buf = [0u8; 4096];
    let n = socket.peek(&mut buf).await
        .map_err(|e| format!("요청 읽기 실패: {}", e))?;
    let request_line = String::from_utf8_lossy(&buf[..n]);
    let first_line = request_line.lines().next().unwrap_or("");

    log::info!("OAuth callback received: {}", first_line);

    // URL에서 code와 state 추출
    let (code, state) = parse_oauth_callback(first_line)?;

    // State 검증
    if state != expected_state {
        send_http_response(&mut socket, false, "State mismatch").await?;
        return Err("State mismatch - possible CSRF attack".to_string());
    }

    // 토큰 교환 (state도 함께 전송 - Claude CLI와 동일)
    match exchange_token(&code, &code_verifier, &redirect_uri, &state).await {
        Ok(token_response) => {
            // Credentials 저장
            save_oauth_credentials(&token_response)?;

            // 성공 응답
            send_http_response(&mut socket, true, "").await?;

            // Frontend에 이벤트 발송
            let status = ClaudeAuthStatus {
                is_authenticated: true,
                auth_method: "oauth".to_string(),
                subscription_type: None,  // 토큰에서 추출 가능하면 추가
                expires_at: token_response.expires_in.map(|e| {
                    std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .map(|d| d.as_millis() as i64 + e * 1000)
                        .unwrap_or(0)
                }),
                is_expired: false,
                display_info: Some("Claude 계정으로 로그인됨".to_string()),
                error: None,
                platform_note: None,
            };

            let _ = app_handle.emit("claude-auth-success", status);
            log::info!("OAuth login successful!");
            Ok(())
        }
        Err(e) => {
            send_http_response(&mut socket, false, &e).await?;
            Err(e)
        }
    }
}

/// OAuth 콜백 URL 파싱
fn parse_oauth_callback(request_line: &str) -> Result<(String, String), String> {
    // GET /callback?code=xxx&state=yyy HTTP/1.1
    let parts: Vec<&str> = request_line.split_whitespace().collect();
    if parts.len() < 2 {
        return Err("Invalid request".to_string());
    }

    let path = parts[1];
    let query_start = path.find('?').ok_or("No query string")?;
    let query = &path[query_start + 1..];

    let mut code = None;
    let mut state = None;

    for param in query.split('&') {
        let kv: Vec<&str> = param.split('=').collect();
        if kv.len() == 2 {
            match kv[0] {
                "code" => code = Some(urlencoding::decode(kv[1]).unwrap_or_default().to_string()),
                "state" => state = Some(urlencoding::decode(kv[1]).unwrap_or_default().to_string()),
                _ => {}
            }
        }
    }

    match (code, state) {
        (Some(c), Some(s)) => Ok((c, s)),
        _ => Err("Missing code or state in callback".to_string()),
    }
}

/// 토큰 교환 (authorization code → access token)
/// Claude CLI는 JSON 형식으로 토큰 요청을 보냄
async fn exchange_token(code: &str, code_verifier: &str, redirect_uri: &str, state: &str) -> Result<OAuthTokenResponse, String> {
    let client = reqwest::Client::new();

    // JSON 형식으로 요청 (Claude CLI와 동일)
    let body = serde_json::json!({
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": CLAUDE_CODE_CLIENT_ID,
        "code_verifier": code_verifier,
        "state": state
    });

    log::info!("Exchanging token with URL: {}", ANTHROPIC_TOKEN_URL);

    let response = client
        .post(ANTHROPIC_TOKEN_URL)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("토큰 교환 요청 실패: {}", e))?;

    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        log::error!("Token exchange failed: status={}, body={}", status, error_text);
        return Err(format!("토큰 교환 실패 ({}): {}", status, error_text));
    }

    response.json::<OAuthTokenResponse>().await
        .map_err(|e| format!("토큰 응답 파싱 실패: {}", e))
}

/// OAuth Credentials를 Keychain에 저장
fn save_oauth_credentials(token: &OAuthTokenResponse) -> Result<(), String> {
    let expires_at = token.expires_in.map(|e| {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64 + e * 1000)
            .unwrap_or(0)
    }).unwrap_or(0);

    let credentials = serde_json::json!({
        "claudeAiOauth": {
            "accessToken": token.access_token,
            "refreshToken": token.refresh_token,
            "expiresAt": expires_at,
            "scopes": token.scope.as_ref().map(|s| s.split(' ').collect::<Vec<_>>()),
            "subscriptionType": null,
            "rateLimitTier": null
        }
    });

    let creds_json = serde_json::to_string(&credentials)
        .map_err(|e| format!("JSON 직렬화 실패: {}", e))?;

    // Keychain에 저장
    let username = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .unwrap_or_else(|_| "default".to_string());

    let entry = keyring::Entry::new(CLAUDE_CODE_KEYCHAIN_SERVICE, &username)
        .map_err(|e| format!("Keyring Entry 생성 실패: {}", e))?;

    entry.set_password(&creds_json)
        .map_err(|e| format!("Credentials 저장 실패: {}", e))?;

    log::info!("OAuth credentials saved to keychain (account: {})", username);
    Ok(())
}

/// HTTP 응답 전송 (성공/실패 통합)
async fn send_http_response(socket: &mut tokio::net::TcpStream, success: bool, error_msg: &str) -> Result<(), String> {
    use tokio::io::AsyncWriteExt;

    // 먼저 요청 데이터를 읽어서 버퍼 비우기
    let mut drain_buf = [0u8; 4096];
    let _ = tokio::time::timeout(
        std::time::Duration::from_millis(100),
        socket.readable()
    ).await;
    let _ = socket.try_read(&mut drain_buf);

    let (status, html) = if success {
        ("200 OK", r#"<!DOCTYPE html>
<html>
<head><title>로그인 성공</title><style>
body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a1a2e}
.container{text-align:center;color:#fff;padding:40px}
h1{color:#4ade80;margin-bottom:20px}
p{color:#a0a0a0}
</style></head>
<body><div class="container">
<h1>✓ 로그인 성공!</h1>
<p>이 창을 닫고 ANYON 앱으로 돌아가세요.</p>
<script>setTimeout(()=>window.close(),3000)</script>
</div></body></html>"#.to_string())
    } else {
        ("400 Bad Request", format!(r#"<!DOCTYPE html>
<html>
<head><title>로그인 실패</title><style>
body{{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#1a1a2e}}
.container{{text-align:center;color:#fff;padding:40px}}
h1{{color:#f87171;margin-bottom:20px}}
p{{color:#a0a0a0}}
</style></head>
<body><div class="container">
<h1>✗ 로그인 실패</h1>
<p>{}</p>
</div></body></html>"#, error_msg))
    };

    let response = format!(
        "HTTP/1.1 {}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        status,
        html.len(),
        html
    );

    socket.write_all(response.as_bytes()).await
        .map_err(|e| format!("응답 전송 실패: {}", e))?;
    socket.flush().await
        .map_err(|e| format!("응답 플러시 실패: {}", e))?;

    Ok(())
}

// ============================================================
// 폴링 기반 로그인 감지 (터미널 로그인 후 사용)
// ============================================================

/// 터미널 로그인 후 폴링 시작
/// Keychain을 2초마다 확인하여 로그인 감지 시 이벤트 발송
#[tauri::command]
pub async fn claude_auth_poll_for_login(app_handle: tauri::AppHandle) -> Result<(), String> {
    // 기존 폴링 중단
    POLL_STOP_FLAG.store(false, Ordering::SeqCst);

    let app = app_handle.clone();

    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(2));
        let max_attempts = 150; // 5분 제한

        for attempt in 0..max_attempts {
            interval.tick().await;

            // 중단 플래그 확인
            if POLL_STOP_FLAG.load(Ordering::SeqCst) {
                log::info!("Login poll stopped by user");
                break;
            }

            // Credentials 확인
            match read_claude_credentials() {
                Ok((creds, platform_note)) => {
                    if let Some(oauth) = creds.claude_ai_oauth {
                        let now = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .map(|d| d.as_millis() as i64)
                            .unwrap_or(0);

                        if oauth.expires_at > now {
                            log::info!("Login detected via polling (attempt {})", attempt + 1);

                            let status = ClaudeAuthStatus {
                                is_authenticated: true,
                                auth_method: "oauth".to_string(),
                                subscription_type: oauth.subscription_type.clone(),
                                expires_at: Some(oauth.expires_at),
                                is_expired: false,
                                display_info: oauth.subscription_type.as_ref().map(|t| {
                                    match t.as_str() {
                                        "max" => "Claude Max".to_string(),
                                        "pro" => "Claude Pro".to_string(),
                                        "free" => "무료 플랜".to_string(),
                                        other => other.to_string(),
                                    }
                                }),
                                error: None,
                                platform_note,
                            };

                            let _ = app.emit("claude-auth-success", status);
                            return;
                        }
                    }
                }
                Err(e) => {
                    log::debug!("Poll check failed (attempt {}): {}", attempt + 1, e);
                }
            }
        }

        log::info!("Login poll timeout after {} attempts", max_attempts);
        let _ = app.emit("claude-auth-timeout", ());
    });

    Ok(())
}

/// 폴링 중단
#[tauri::command]
pub async fn claude_auth_stop_polling() -> Result<(), String> {
    POLL_STOP_FLAG.store(true, Ordering::SeqCst);
    log::info!("Login polling stop requested");
    Ok(())
}
