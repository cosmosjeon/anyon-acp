use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager};
use tokio::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

use super::helpers::{create_command_with_env, find_claude_binary, get_claude_dir};
use super::shared::{ClaudeMdFile, ClaudeSettings, ClaudeVersionStatus};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AnyonInstallationStatus {
    /// Whether .anyon directory exists
    pub is_installed: bool,
    /// Whether .claude directory exists
    pub has_claude_dir: bool,
    /// List of missing directories
    pub missing_dirs: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct PackageJson {
    dependencies: Option<std::collections::HashMap<String, String>>,
    #[serde(rename = "devDependencies")]
    dev_dependencies: Option<std::collections::HashMap<String, String>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct NpxRunResult {
    /// Whether the command succeeded
    pub success: bool,
    /// stdout output
    pub stdout: String,
    /// stderr output
    pub stderr: String,
    /// Exit code if available
    pub exit_code: Option<i32>,
}

#[tauri::command]
pub async fn get_claude_settings() -> Result<ClaudeSettings, String> {
    log::info!("Reading Claude settings");

    let claude_dir = get_claude_dir().map_err(|e| e.to_string())?;
    let settings_path = claude_dir.join("settings.json");

    if !settings_path.exists() {
        log::warn!("Settings file not found, returning empty settings");
        return Ok(ClaudeSettings {
            data: serde_json::json!({}),
        });
    }

    let content = fs::read_to_string(&settings_path)
        .map_err(|e| format!("Failed to read settings file: {}", e))?;

    let data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse settings JSON: {}", e))?;

    Ok(ClaudeSettings { data })
}

#[tauri::command]
pub async fn get_system_prompt() -> Result<String, String> {
    log::info!("Reading CLAUDE.md system prompt");

    let claude_dir = get_claude_dir().map_err(|e| e.to_string())?;
    let claude_md_path = claude_dir.join("CLAUDE.md");

    if !claude_md_path.exists() {
        log::warn!("CLAUDE.md not found");
        return Ok(String::new());
    }

    fs::read_to_string(&claude_md_path).map_err(|e| format!("Failed to read CLAUDE.md: {}", e))
}

#[tauri::command]
pub async fn check_claude_version(app: AppHandle) -> Result<ClaudeVersionStatus, String> {
    log::info!("Checking Claude Code version");

    let claude_path = match find_claude_binary(&app) {
        Ok(path) => path,
        Err(e) => {
            return Ok(ClaudeVersionStatus {
                is_installed: false,
                version: None,
                output: e,
            });
        }
    };

    use log::debug;
    debug!("Claude path: {}", claude_path);

    // In production builds, we can't check the version directly
    #[cfg(not(debug_assertions))]
    {
        log::warn!("Cannot check claude version in production build");
        // If we found a path (either stored or in common locations), assume it's installed
        if claude_path != "claude" && PathBuf::from(&claude_path).exists() {
            return Ok(ClaudeVersionStatus {
                is_installed: true,
                version: None,
                output: "Claude binary found at: ".to_string() + &claude_path,
            });
        } else {
            return Ok(ClaudeVersionStatus {
                is_installed: false,
                version: None,
                output: "Cannot verify Claude installation in production build. Please ensure Claude Code is installed.".to_string(),
            });
        }
    }

    #[cfg(debug_assertions)]
    {
        let output = std::process::Command::new(claude_path)
            .arg("--version")
            .output();

        match output {
            Ok(output) => {
                let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();

                // Use regex to directly extract version pattern (e.g., "1.0.41")
                let version_regex =
                    regex::Regex::new(r"(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?(?:\+[a-zA-Z0-9.-]+)?)")
                        .ok();

                let version = if let Some(regex) = version_regex {
                    regex
                        .captures(&stdout)
                        .and_then(|captures| captures.get(1))
                        .map(|m| m.as_str().to_string())
                } else {
                    None
                };

                let full_output = if stderr.is_empty() {
                    stdout.clone()
                } else {
                    format!("{}\n{}", stdout, stderr)
                };

                // Check if the output matches the expected format
                // Expected format: "1.0.17 (Claude Code)" or similar
                let is_valid = stdout.contains("(Claude Code)") || stdout.contains("Claude Code");

                Ok(ClaudeVersionStatus {
                    is_installed: is_valid && output.status.success(),
                    version,
                    output: full_output.trim().to_string(),
                })
            }
            Err(e) => {
                log::error!("Failed to run claude command: {}", e);
                Ok(ClaudeVersionStatus {
                    is_installed: false,
                    version: None,
                    output: format!("Command not found: {}", e),
                })
            }
        }
    }
}

#[tauri::command]
pub async fn save_system_prompt(content: String) -> Result<String, String> {
    log::info!("Saving CLAUDE.md system prompt");

    let claude_dir = get_claude_dir().map_err(|e| e.to_string())?;
    let claude_md_path = claude_dir.join("CLAUDE.md");

    fs::write(&claude_md_path, content).map_err(|e| format!("Failed to write CLAUDE.md: {}", e))?;

    Ok("System prompt saved successfully".to_string())
}

#[tauri::command]
pub async fn save_claude_settings(settings: serde_json::Value) -> Result<String, String> {
    log::info!("Saving Claude settings");

    let claude_dir = get_claude_dir().map_err(|e| e.to_string())?;
    let settings_path = claude_dir.join("settings.json");

    // Pretty print the JSON with 2-space indentation
    let json_string = serde_json::to_string_pretty(&settings)
        .map_err(|e| format!("Failed to serialize settings: {}", e))?;

    fs::write(&settings_path, json_string)
        .map_err(|e| format!("Failed to write settings file: {}", e))?;

    Ok("Settings saved successfully".to_string())
}

#[tauri::command]
pub async fn find_claude_md_files(project_path: String) -> Result<Vec<ClaudeMdFile>, String> {
    log::info!("Finding CLAUDE.md files in project: {}", project_path);

    let path = PathBuf::from(&project_path);
    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let mut claude_files = Vec::new();
    find_claude_md_recursive(&path, &path, &mut claude_files)?;

    // Sort by relative path
    claude_files.sort_by(|a, b| a.relative_path.cmp(&b.relative_path));

    log::info!("Found {} CLAUDE.md files", claude_files.len());
    Ok(claude_files)
}

fn find_claude_md_recursive(
    current_path: &PathBuf,
    project_root: &PathBuf,
    claude_files: &mut Vec<ClaudeMdFile>,
) -> Result<(), String> {
    let entries = fs::read_dir(current_path)
        .map_err(|e| format!("Failed to read directory {:?}: {}", current_path, e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();

        // Skip hidden files/directories
        if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
            if name.starts_with('.') {
                continue;
            }
        }

        if path.is_dir() {
            // Skip common directories that shouldn't be searched
            if let Some(dir_name) = path.file_name().and_then(|n| n.to_str()) {
                if matches!(
                    dir_name,
                    "node_modules" | "target" | ".git" | "dist" | "build" | ".next" | "__pycache__"
                ) {
                    continue;
                }
            }

            find_claude_md_recursive(&path, project_root, claude_files)?;
        } else if path.is_file() {
            // Check if it's a CLAUDE.md file (case insensitive)
            if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                if file_name.eq_ignore_ascii_case("CLAUDE.md") {
                    let metadata = fs::metadata(&path)
                        .map_err(|e| format!("Failed to read file metadata: {}", e))?;

                    let relative_path = path
                        .strip_prefix(project_root)
                        .map_err(|e| format!("Failed to get relative path: {}", e))?
                        .to_string_lossy()
                        .to_string();

                    let modified = metadata
                        .modified()
                        .unwrap_or(SystemTime::UNIX_EPOCH)
                        .duration_since(SystemTime::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs();

                    claude_files.push(ClaudeMdFile {
                        relative_path,
                        absolute_path: path.to_string_lossy().to_string(),
                        size: metadata.len(),
                        modified,
                    });
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn read_claude_md_file(file_path: String) -> Result<String, String> {
    log::info!("Reading CLAUDE.md file: {}", file_path);

    let path = PathBuf::from(&file_path);
    if !path.exists() {
        return Err(format!("File does not exist: {}", file_path));
    }

    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn save_claude_md_file(file_path: String, content: String) -> Result<String, String> {
    log::info!("Saving CLAUDE.md file: {}", file_path);

    let path = PathBuf::from(&file_path);

    // Ensure the parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create parent directory: {}", e))?;
    }

    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok("File saved successfully".to_string())
}

#[tauri::command]
pub async fn check_anyon_installed(
    project_path: String,
) -> Result<AnyonInstallationStatus, String> {
    let path = PathBuf::from(&project_path);

    let anyon_dir = path.join(".anyon");
    let claude_dir = path.join(".claude");

    let has_anyon = anyon_dir.exists() && anyon_dir.is_dir();
    let has_claude = claude_dir.exists() && claude_dir.is_dir();

    let mut missing_dirs = Vec::new();
    if !has_anyon {
        missing_dirs.push(".anyon".to_string());
    }
    if !has_claude {
        missing_dirs.push(".claude".to_string());
    }

    Ok(AnyonInstallationStatus {
        is_installed: has_anyon,
        has_claude_dir: has_claude,
        missing_dirs,
    })
}

#[tauri::command]
pub async fn install_anyon_templates(
    project_path: String,
    app_handle: AppHandle,
) -> Result<NpxRunResult, String> {
    let project_dir = PathBuf::from(&project_path);

    if !project_dir.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    // Emit start event
    let _ = app_handle.emit("anyon-install-start", &project_path);

    log::info!("[Rust] Installing Anyon templates locally (no NPM)");

    // Get the template source directory
    // In development: templates are at the project root
    // In production: templates will be bundled with the app
    #[cfg(debug_assertions)]
    let template_source = {
        // Development mode: use local .anyon directory
        let current_exe = std::env::current_exe()
            .map_err(|e| format!("Failed to get current exe path: {}", e))?;

        // Navigate up from target/debug/anyon-claude to find project root
        let mut project_root = current_exe.parent()
            .and_then(|p| p.parent()) // target/debug -> target
            .and_then(|p| p.parent()) // target -> project root
            .ok_or("Failed to find project root")?;

        // If we're in src-tauri/target, go up two more levels
        if project_root.ends_with("src-tauri") {
            project_root = project_root.parent()
                .ok_or("Failed to find project root from src-tauri")?;
        }

        project_root.join(".anyon")
    };

    #[cfg(not(debug_assertions))]
    let template_source = {
        // Production mode: use bundled resources
        app_handle.path().resource_dir()
            .map_err(|e| format!("Failed to get resource dir: {}", e))?
            .join(".anyon")
    };

    log::info!("[Rust] Template source: {:?}", template_source);

    if !template_source.exists() {
        return Err(format!("Template source not found: {:?}", template_source));
    }

    // Create .anyon directory in project
    let anyon_dest = project_dir.join(".anyon");
    let claude_dest = project_dir.join(".claude");

    // Copy .anyon directory
    log::info!("[Rust] Copying .anyon to {:?}", anyon_dest);
    copy_dir_recursive(&template_source, &anyon_dest)
        .map_err(|e| format!("Failed to copy .anyon directory: {}", e))?;

    // Create .claude/agents directory
    log::info!("[Rust] Creating .claude/agents directory");
    let agents_dest = claude_dest.join("agents");
    fs::create_dir_all(&agents_dest)
        .map_err(|e| format!("Failed to create .claude/agents directory: {}", e))?;

    let result = NpxRunResult {
        success: true,
        stdout: format!("Successfully installed Anyon templates to {}", project_path),
        stderr: String::new(),
        exit_code: Some(0),
    };

    // Emit completion event
    let _ = app_handle.emit("anyon-install-complete", &result);

    Ok(result)
}

#[tauri::command]
pub async fn check_is_git_repo(project_path: String) -> Result<bool, String> {
    log::info!("[Rust] Checking if {} is a git repo", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        log::error!("[Rust] Project path does not exist: {}", project_path);
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let git_dir = path.join(".git");
    let is_git = git_dir.exists() && git_dir.is_dir();
    log::info!("[Rust] Is git repo: {}", is_git);
    Ok(is_git)
}

#[tauri::command]
pub async fn init_git_repo(
    project_path: String,
    app_handle: AppHandle,
) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Initializing git repo at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        log::error!("[Rust] Project path does not exist: {}", project_path);
        return Err(format!("Project path does not exist: {}", project_path));
    }

    // Emit start event
    let _ = app_handle.emit("git-init-start", &project_path);

    // Run git init
    log::info!("[Rust] Running 'git init' command...");

    let mut cmd = Command::new("git");
    cmd.arg("init")
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.output().await.map_err(|e| {
        log::error!("[Rust] Failed to run git init: {}", e);
        format!("Failed to run git init: {}", e)
    })?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let success = output.status.success();
    let exit_code = output.status.code();

    log::info!(
        "[Rust] Git init result - success: {}, stdout: {}, stderr: {}",
        success,
        stdout,
        stderr
    );

    // If git init succeeded, create an initial empty commit for rollback capability
    if success {
        log::info!("[Rust] Creating initial empty commit...");

        let mut commit_cmd = Command::new("git");
        commit_cmd
            .args(["commit", "--allow-empty", "-m", "Initial commit (ANYON)"])
            .current_dir(&path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        #[cfg(target_os = "windows")]
        commit_cmd.creation_flags(CREATE_NO_WINDOW);

        match commit_cmd.output().await {
            Ok(commit_output) => {
                let commit_success = commit_output.status.success();
                let commit_stdout = String::from_utf8_lossy(&commit_output.stdout).to_string();
                let commit_stderr = String::from_utf8_lossy(&commit_output.stderr).to_string();
                log::info!(
                    "[Rust] Initial commit result - success: {}, stdout: {}, stderr: {}",
                    commit_success,
                    commit_stdout,
                    commit_stderr
                );
            }
            Err(e) => {
                log::warn!("[Rust] Failed to create initial commit: {}", e);
                // Not critical, continue anyway
            }
        }
    }

    let result = NpxRunResult {
        success,
        stdout,
        stderr,
        exit_code,
    };

    // Emit completion event
    let _ = app_handle.emit("git-init-complete", &result);

    Ok(result)
}

#[tauri::command]
pub async fn git_add_all(project_path: String) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Running 'git add .' at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let mut cmd = Command::new("git");
    cmd.args(["add", "."])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to run git add: {}", e))?;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub async fn git_commit(project_path: String, message: String) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Running 'git commit' at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let mut cmd = Command::new("git");
    cmd.args(["commit", "-m", &message])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to run git commit: {}", e))?;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub async fn git_set_remote(
    project_path: String,
    remote_url: String,
) -> Result<NpxRunResult, String> {
    log::info!(
        "[Rust] Setting git remote to: {} at: {}",
        remote_url,
        project_path
    );
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    // First try to remove existing origin (ignore errors)
    let mut remove_cmd = Command::new("git");
    remove_cmd
        .args(["remote", "remove", "origin"])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    remove_cmd.creation_flags(CREATE_NO_WINDOW);

    let _ = remove_cmd.output().await;

    // Add new origin
    let mut cmd = Command::new("git");
    cmd.args(["remote", "add", "origin", &remote_url])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to set git remote: {}", e))?;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub async fn git_push(
    project_path: String,
    remote_url: String,
    token: String,
    branch: Option<String>,
) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Running 'git push' at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let branch_name = branch.unwrap_or_else(|| "main".to_string());

    // Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
    let auth_url = if remote_url.starts_with("https://github.com/") {
        remote_url.replace(
            "https://github.com/",
            &format!("https://{}@github.com/", token),
        )
    } else {
        remote_url.clone()
    };

    // Set remote with authenticated URL
    let mut set_remote = Command::new("git");
    set_remote
        .args(["remote", "set-url", "origin", &auth_url])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    set_remote.creation_flags(CREATE_NO_WINDOW);

    let _ = set_remote.output().await;

    // Push
    let mut cmd = Command::new("git");
    cmd.args(["push", "-u", "origin", &branch_name])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to run git push: {}", e))?;

    // Reset remote URL to non-authenticated version (security)
    let mut reset_remote = Command::new("git");
    reset_remote
        .args(["remote", "set-url", "origin", &remote_url])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    reset_remote.creation_flags(CREATE_NO_WINDOW);

    let _ = reset_remote.output().await;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub async fn git_status(project_path: String) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Running 'git status' at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let mut cmd = Command::new("git");
    cmd.args(["status", "--porcelain"])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to run git status: {}", e))?;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

#[tauri::command]
pub async fn git_current_branch(project_path: String) -> Result<NpxRunResult, String> {
    log::info!("[Rust] Getting current branch at: {}", project_path);
    let path = PathBuf::from(&project_path);

    if !path.exists() {
        return Err(format!("Project path does not exist: {}", project_path));
    }

    let mut cmd = Command::new("git");
    cmd.args(["branch", "--show-current"])
        .current_dir(&path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd
        .output()
        .await
        .map_err(|e| format!("Failed to get current branch: {}", e))?;

    Ok(NpxRunResult {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).trim().to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code(),
    })
}

/// Recursively copy a directory
fn copy_dir_recursive(src: &Path, dst: &Path) -> std::io::Result<()> {
    if !dst.exists() {
        fs::create_dir_all(dst)?;
    }

    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if ty.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            fs::copy(&src_path, &dst_path)?;
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::TempDir;

    /// Helper function to create a test session file
    fn create_test_session_file(
        dir: &PathBuf,
        filename: &str,
        content: &str,
    ) -> Result<(), std::io::Error> {
        let file_path = dir.join(filename);
        let mut file = fs::File::create(file_path)?;
        file.write_all(content.as_bytes())?;
        Ok(())
    }

    #[test]
    fn test_get_project_path_from_sessions_normal_case() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // Create a session file with cwd on the first line
        let content = r#"{"type":"system","cwd":"/Users/test/my-project"}"#;
        create_test_session_file(&project_dir, "session1.jsonl", content).unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "/Users/test/my-project");
    }

    #[test]
    fn test_get_project_path_from_sessions_with_hyphen() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // This is the bug scenario - project path contains hyphens
        let content = r#"{"type":"system","cwd":"/Users/test/data-discovery"}"#;
        create_test_session_file(&project_dir, "session1.jsonl", content).unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "/Users/test/data-discovery");
    }

    #[test]
    fn test_get_project_path_from_sessions_null_cwd_first_line() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // First line has null cwd, second line has valid path
        let content = format!(
            "{}\n{}",
            r#"{"type":"system","cwd":null}"#,
            r#"{"type":"system","cwd":"/Users/test/valid-path"}"#
        );
        create_test_session_file(&project_dir, "session1.jsonl", &content).unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "/Users/test/valid-path");
    }

    #[test]
    fn test_get_project_path_from_sessions_multiple_lines() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // Multiple lines with cwd appearing on line 5
        let content = format!(
            "{}\n{}\n{}\n{}\n{}",
            r#"{"type":"other"}"#,
            r#"{"type":"system","cwd":null}"#,
            r#"{"type":"message"}"#,
            r#"{"type":"system"}"#,
            r#"{"type":"system","cwd":"/Users/test/project"}"#
        );
        create_test_session_file(&project_dir, "session1.jsonl", &content).unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "/Users/test/project");
    }

    #[test]
    fn test_get_project_path_from_sessions_empty_dir() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_err());
        assert_eq!(
            result.unwrap_err(),
            "Could not determine project path from session files"
        );
    }

    #[test]
    fn test_get_project_path_from_sessions_no_jsonl_files() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // Create a non-JSONL file
        create_test_session_file(&project_dir, "readme.txt", "Some text").unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_project_path_from_sessions_no_cwd() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // JSONL file without any cwd field
        let content = format!(
            "{}\n{}\n{}",
            r#"{"type":"system"}"#, r#"{"type":"message"}"#, r#"{"type":"other"}"#
        );
        create_test_session_file(&project_dir, "session1.jsonl", &content).unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_err());
    }

    #[test]
    fn test_get_project_path_from_sessions_multiple_sessions() {
        let temp_dir = TempDir::new().unwrap();
        let project_dir = temp_dir.path().to_path_buf();

        // Create multiple session files - should return from first valid one
        create_test_session_file(
            &project_dir,
            "session1.jsonl",
            r#"{"type":"system","cwd":"/path1"}"#,
        )
        .unwrap();
        create_test_session_file(
            &project_dir,
            "session2.jsonl",
            r#"{"type":"system","cwd":"/path2"}"#,
        )
        .unwrap();

        let result = get_project_path_from_sessions(&project_dir);
        assert!(result.is_ok());
        // Should get one of the paths (implementation checks first file it finds)
        let path = result.unwrap();
        assert!(path == "/path1" || path == "/path2");
    }
}
