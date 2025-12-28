use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// Dependency installation status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DependencyStatus {
    pub name: String,
    pub is_installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
    pub source: String, // "system", "bundled", "homebrew", "nvm", etc.
    pub meets_minimum: bool,
    pub minimum_version: String,
}

/// Overall environment status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentStatus {
    pub nodejs: DependencyStatus,
    pub git: DependencyStatus,
    pub claude_code: DependencyStatus,
    pub all_ready: bool,
    pub platform: String,
    pub package_manager: Option<String>,
}

/// Creates a Command that runs hidden on Windows (no terminal window popup)
#[cfg(target_os = "windows")]
fn create_hidden_command(program: &str) -> Command {
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let mut cmd = Command::new(program);
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}

#[cfg(not(target_os = "windows"))]
fn create_hidden_command(program: &str) -> Command {
    Command::new(program)
}

/// Detect current platform
fn detect_platform() -> String {
    if cfg!(target_os = "macos") {
        "macos".to_string()
    } else if cfg!(target_os = "windows") {
        "windows".to_string()
    } else {
        "linux".to_string()
    }
}

/// Detect available package manager
fn detect_package_manager() -> Option<String> {
    #[cfg(target_os = "macos")]
    {
        // Check for Homebrew
        if std::path::Path::new("/opt/homebrew/bin/brew").exists()
            || std::path::Path::new("/usr/local/bin/brew").exists()
        {
            return Some("homebrew".to_string());
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Check for winget first (preferred), then chocolatey
        if create_hidden_command("where")
            .arg("winget")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some("winget".to_string());
        }
        if create_hidden_command("where")
            .arg("choco")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some("chocolatey".to_string());
        }
    }

    #[cfg(target_os = "linux")]
    {
        if create_hidden_command("which")
            .arg("apt")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some("apt".to_string());
        }
        if create_hidden_command("which")
            .arg("dnf")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some("dnf".to_string());
        }
        if create_hidden_command("which")
            .arg("pacman")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some("pacman".to_string());
        }
    }

    None
}

/// Check Node.js version meets minimum (18.x)
fn check_nodejs_version(version_str: &str) -> bool {
    // Parse "v18.20.0" or "18.20.0"
    let cleaned = version_str.trim().trim_start_matches('v');
    let parts: Vec<u32> = cleaned
        .split('.')
        .filter_map(|s| s.parse().ok())
        .collect();

    parts.first().map(|&major| major >= 18).unwrap_or(false)
}

/// Check Git version meets minimum (2.x)
fn check_git_version(version_str: &str) -> bool {
    // Parse "git version 2.39.0" or just "2.39.0"
    let version_part = version_str
        .split_whitespace()
        .find(|s| s.chars().next().map(|c| c.is_ascii_digit()).unwrap_or(false))
        .unwrap_or("");

    let parts: Vec<u32> = version_part
        .split('.')
        .filter_map(|s| s.parse().ok())
        .collect();

    parts.first().map(|&major| major >= 2).unwrap_or(false)
}

/// Check Node.js installation
fn check_nodejs() -> DependencyStatus {
    let minimum_version = "18.0.0".to_string();

    // Try to find node in PATH
    #[cfg(target_os = "windows")]
    let which_cmd = "where";
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";

    let path_result = create_hidden_command(which_cmd)
        .arg("node")
        .output();

    let path = path_result
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .next()
                .map(|s| s.trim().to_string())
        });

    if path.is_none() {
        return DependencyStatus {
            name: "nodejs".to_string(),
            is_installed: false,
            version: None,
            path: None,
            source: "not_found".to_string(),
            meets_minimum: false,
            minimum_version,
        };
    }

    // Get version
    let version_result = create_hidden_command("node")
        .arg("--version")
        .output();

    let version = version_result
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    let meets_minimum = version
        .as_ref()
        .map(|v| check_nodejs_version(v))
        .unwrap_or(false);

    // Detect source (nvm, homebrew, system, etc.)
    let source = detect_nodejs_source(&path);

    DependencyStatus {
        name: "nodejs".to_string(),
        is_installed: true,
        version,
        path,
        source,
        meets_minimum,
        minimum_version,
    }
}

/// Detect Node.js installation source
fn detect_nodejs_source(path: &Option<String>) -> String {
    if let Some(p) = path {
        let p_lower = p.to_lowercase();
        if p_lower.contains("nvm") {
            return "nvm".to_string();
        }
        if p_lower.contains("homebrew") || p_lower.contains("/opt/homebrew") {
            return "homebrew".to_string();
        }
        if p_lower.contains("volta") {
            return "volta".to_string();
        }
        if p_lower.contains("fnm") {
            return "fnm".to_string();
        }
        #[cfg(target_os = "windows")]
        if p_lower.contains("program files") || p_lower.contains("nodejs") {
            return "system".to_string();
        }
    }
    "system".to_string()
}

/// Check Git installation
fn check_git() -> DependencyStatus {
    let minimum_version = "2.0.0".to_string();

    #[cfg(target_os = "windows")]
    let which_cmd = "where";
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";

    let path_result = create_hidden_command(which_cmd)
        .arg("git")
        .output();

    let path = path_result
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .next()
                .map(|s| s.trim().to_string())
        });

    if path.is_none() {
        return DependencyStatus {
            name: "git".to_string(),
            is_installed: false,
            version: None,
            path: None,
            source: "not_found".to_string(),
            meets_minimum: false,
            minimum_version,
        };
    }

    // Get version
    let version_result = create_hidden_command("git")
        .arg("--version")
        .output();

    let version = version_result
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    let meets_minimum = version
        .as_ref()
        .map(|v| check_git_version(v))
        .unwrap_or(false);

    // Detect source
    let source = detect_git_source(&path);

    DependencyStatus {
        name: "git".to_string(),
        is_installed: true,
        version,
        path,
        source,
        meets_minimum,
        minimum_version,
    }
}

/// Detect Git installation source
fn detect_git_source(path: &Option<String>) -> String {
    if let Some(p) = path {
        let p_lower = p.to_lowercase();
        if p_lower.contains("homebrew") || p_lower.contains("/opt/homebrew") {
            return "homebrew".to_string();
        }
        #[cfg(target_os = "macos")]
        if p_lower.contains("/usr/bin/git") {
            return "xcode".to_string();
        }
        #[cfg(target_os = "windows")]
        if p_lower.contains("git") && p_lower.contains("cmd") {
            return "git-for-windows".to_string();
        }
    }
    "system".to_string()
}

/// Check Claude Code installation
fn check_claude_code() -> DependencyStatus {
    let minimum_version = "1.0.0".to_string();

    #[cfg(target_os = "windows")]
    let which_cmd = "where";
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";

    let path_result = create_hidden_command(which_cmd)
        .arg("claude")
        .output();

    let path = path_result
        .ok()
        .filter(|o| o.status.success())
        .and_then(|o| {
            String::from_utf8_lossy(&o.stdout)
                .lines()
                .next()
                .map(|s| s.trim().to_string())
        });

    if path.is_none() {
        return DependencyStatus {
            name: "claude-code".to_string(),
            is_installed: false,
            version: None,
            path: None,
            source: "not_found".to_string(),
            meets_minimum: false,
            minimum_version,
        };
    }

    // Get version
    let version_result = create_hidden_command("claude")
        .arg("--version")
        .output();

    let version = version_result
        .ok()
        .filter(|o| o.status.success())
        .map(|o| {
            let output = String::from_utf8_lossy(&o.stdout);
            // Extract version number from output (e.g., "claude-code/1.0.41")
            output
                .split('/')
                .last()
                .map(|s| s.trim().to_string())
                .unwrap_or_else(|| output.trim().to_string())
        });

    DependencyStatus {
        name: "claude-code".to_string(),
        is_installed: true,
        version,
        path,
        source: "npm".to_string(),
        meets_minimum: true, // Any installed version is fine
        minimum_version,
    }
}

/// Check all environment dependencies
#[tauri::command]
pub async fn check_environment_status(_app: AppHandle) -> Result<EnvironmentStatus, String> {
    log::info!("Checking environment status...");

    let nodejs = check_nodejs();
    let git = check_git();
    let claude_code = check_claude_code();

    let all_ready = nodejs.is_installed && nodejs.meets_minimum
        && git.is_installed && git.meets_minimum
        && claude_code.is_installed;

    let platform = detect_platform();
    let package_manager = detect_package_manager();

    log::info!(
        "Environment check complete: nodejs={}, git={}, claude_code={}, all_ready={}",
        nodejs.is_installed,
        git.is_installed,
        claude_code.is_installed,
        all_ready
    );

    Ok(EnvironmentStatus {
        nodejs,
        git,
        claude_code,
        all_ready,
        platform,
        package_manager,
    })
}

/// Open system terminal application
#[tauri::command]
pub async fn open_terminal() -> Result<(), String> {
    log::info!("Opening terminal...");

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .args(["-a", "Terminal"])
            .spawn()
            .map_err(|e| format!("Failed to open Terminal: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", "start", "cmd"])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW for the parent process
            .spawn()
            .map_err(|e| format!("Failed to open Command Prompt: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        // Try common terminal emulators in order of preference
        let terminals = [
            ("gnome-terminal", vec![]),
            ("konsole", vec![]),
            ("xfce4-terminal", vec![]),
            ("xterm", vec![]),
            ("x-terminal-emulator", vec![]),
        ];

        let mut opened = false;
        for (terminal, args) in terminals {
            if Command::new("which")
                .arg(terminal)
                .output()
                .map(|o| o.status.success())
                .unwrap_or(false)
            {
                Command::new(terminal)
                    .args(args)
                    .spawn()
                    .map_err(|e| format!("Failed to open terminal: {}", e))?;
                opened = true;
                break;
            }
        }

        if !opened {
            return Err("No supported terminal emulator found".to_string());
        }
    }

    Ok(())
}

/// Open URL in default browser
#[tauri::command]
pub async fn open_url(url: String) -> Result<(), String> {
    log::info!("Opening URL: {}", url);

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", "start", "", &url])
            .creation_flags(0x08000000)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| format!("Failed to open URL: {}", e))?;
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_nodejs_version() {
        assert!(check_nodejs_version("v20.10.0"));
        assert!(check_nodejs_version("v18.0.0"));
        assert!(check_nodejs_version("18.20.0"));
        assert!(!check_nodejs_version("v16.0.0"));
        assert!(!check_nodejs_version("v14.17.0"));
    }

    #[test]
    fn test_check_git_version() {
        assert!(check_git_version("git version 2.39.0"));
        assert!(check_git_version("git version 2.0.0"));
        assert!(check_git_version("2.45.0"));
        assert!(!check_git_version("git version 1.9.0"));
    }

    #[test]
    fn test_detect_platform() {
        let platform = detect_platform();
        assert!(["macos", "windows", "linux"].contains(&platform.as_str()));
    }
}
