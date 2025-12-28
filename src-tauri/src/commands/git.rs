use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

/// Creates a Command that runs hidden on Windows (no terminal window popup)
#[cfg(target_os = "windows")]
fn create_hidden_command(program: &str) -> Command {
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let mut cmd = Command::new(program);
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}

/// Creates a Command (non-Windows - no special flags needed)
#[cfg(not(target_os = "windows"))]
fn create_hidden_command(program: &str) -> Command {
    Command::new(program)
}

/// Get the current HEAD commit SHA of a git repository
#[tauri::command]
pub async fn get_git_head_sha(project_path: String) -> Result<String, String> {
    log::info!("Getting git HEAD SHA for: {}", project_path);

    let output = create_hidden_command("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git rev-parse: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("git rev-parse failed: {}", stderr));
    }

    let sha = String::from_utf8_lossy(&output.stdout).trim().to_string();
    log::info!("Current HEAD SHA: {}", sha);
    Ok(sha)
}

/// Check if the git working directory has uncommitted changes
#[tauri::command]
pub async fn has_git_uncommitted_changes(project_path: String) -> Result<bool, String> {
    log::info!("Checking for uncommitted changes in: {}", project_path);

    // Check for staged changes
    let staged = create_hidden_command("git")
        .args(["diff", "--cached", "--quiet"])
        .current_dir(&project_path)
        .status()
        .map_err(|e| format!("Failed to execute git diff --cached: {}", e))?;

    // Check for unstaged changes
    let unstaged = create_hidden_command("git")
        .args(["diff", "--quiet"])
        .current_dir(&project_path)
        .status()
        .map_err(|e| format!("Failed to execute git diff: {}", e))?;

    // Check for untracked files
    let untracked = create_hidden_command("git")
        .args(["ls-files", "--others", "--exclude-standard"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git ls-files: {}", e))?;

    let has_untracked = !untracked.stdout.is_empty();
    let has_changes = !staged.success() || !unstaged.success() || has_untracked;

    log::info!("Has uncommitted changes: {}", has_changes);
    Ok(has_changes)
}

/// Reset git working directory to a specific commit
/// WARNING: This is a destructive operation that discards all changes!
#[tauri::command]
pub async fn git_reset_hard(project_path: String, commit_sha: String) -> Result<(), String> {
    log::info!("Resetting {} to commit {}", project_path, commit_sha);

    // First, clean untracked files
    let clean_output = create_hidden_command("git")
        .args(["clean", "-fd"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git clean: {}", e))?;

    if !clean_output.status.success() {
        let stderr = String::from_utf8_lossy(&clean_output.stderr);
        log::warn!("git clean warning: {}", stderr);
    }

    // Then reset to the specified commit
    let reset_output = create_hidden_command("git")
        .args(["reset", "--hard", &commit_sha])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git reset: {}", e))?;

    if !reset_output.status.success() {
        let stderr = String::from_utf8_lossy(&reset_output.stderr);
        return Err(format!("git reset failed: {}", stderr));
    }

    log::info!("Successfully reset to {}", commit_sha);
    Ok(())
}

/// Get a summary of changes between current HEAD and a target commit
#[tauri::command]
pub async fn get_git_diff_summary(
    project_path: String,
    target_commit_sha: String,
) -> Result<GitDiffSummary, String> {
    log::info!(
        "Getting diff summary for {} between HEAD and {}",
        project_path,
        target_commit_sha
    );

    // Get the number of commits that would be rolled back
    let log_output = create_hidden_command("git")
        .args([
            "rev-list",
            "--count",
            &format!("{}..HEAD", target_commit_sha),
        ])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git rev-list: {}", e))?;

    let commits_to_rollback = if log_output.status.success() {
        String::from_utf8_lossy(&log_output.stdout)
            .trim()
            .parse::<u32>()
            .unwrap_or(0)
    } else {
        0
    };

    // Get file change statistics
    let diff_stat = create_hidden_command("git")
        .args(["diff", "--stat", &target_commit_sha, "HEAD"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git diff --stat: {}", e))?;

    let stat_output = String::from_utf8_lossy(&diff_stat.stdout).to_string();

    // Get list of changed files
    let diff_files = create_hidden_command("git")
        .args(["diff", "--name-only", &target_commit_sha, "HEAD"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git diff --name-only: {}", e))?;

    let changed_files: Vec<String> = String::from_utf8_lossy(&diff_files.stdout)
        .lines()
        .map(|s| s.to_string())
        .filter(|s| !s.is_empty())
        .collect();

    Ok(GitDiffSummary {
        commits_to_rollback,
        files_changed: changed_files.len() as u32,
        changed_files,
        stat_summary: stat_output,
    })
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct GitDiffSummary {
    pub commits_to_rollback: u32,
    pub files_changed: u32,
    pub changed_files: Vec<String>,
    pub stat_summary: String,
}

/// Git log entry for version control panel
#[derive(serde::Serialize, serde::Deserialize)]
pub struct GitLogEntry {
    pub sha: String,        // Short SHA (7 chars)
    pub full_sha: String,   // Full SHA
    pub message: String,    // First line of commit message
    pub author: String,     // Author name
    pub timestamp: u64,     // Unix timestamp
}

/// Get git commit history
#[tauri::command]
pub async fn get_git_log(
    project_path: String,
    limit: Option<u32>,
) -> Result<Vec<GitLogEntry>, String> {
    let limit = limit.unwrap_or(50);
    log::info!("Getting git log for: {} (limit: {})", project_path, limit);

    // Format: full_sha|short_sha|message|author|timestamp
    let output = create_hidden_command("git")
        .args([
            "log",
            &format!("-{}", limit),
            "--format=%H|%h|%s|%an|%at",
        ])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git log: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("git log failed: {}", stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let entries: Vec<GitLogEntry> = stdout
        .lines()
        .filter_map(|line| {
            let parts: Vec<&str> = line.splitn(5, '|').collect();
            if parts.len() == 5 {
                Some(GitLogEntry {
                    full_sha: parts[0].to_string(),
                    sha: parts[1].to_string(),
                    message: parts[2].to_string(),
                    author: parts[3].to_string(),
                    timestamp: parts[4].parse().unwrap_or(0),
                })
            } else {
                None
            }
        })
        .collect();

    log::info!("Found {} commits", entries.len());
    Ok(entries)
}

/// Get count of changed files (staged + unstaged + untracked)
#[tauri::command]
pub async fn get_git_changes_count(project_path: String) -> Result<u32, String> {
    log::info!("Getting changes count for: {}", project_path);

    let output = create_hidden_command("git")
        .args(["status", "--porcelain"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git status: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("git status failed: {}", stderr));
    }

    let count = String::from_utf8_lossy(&output.stdout)
        .lines()
        .filter(|line| !line.is_empty())
        .count() as u32;

    Ok(count)
}
