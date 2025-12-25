use std::process::Command;

/// Get the current HEAD commit SHA of a git repository
#[tauri::command]
pub async fn get_git_head_sha(project_path: String) -> Result<String, String> {
    log::info!("Getting git HEAD SHA for: {}", project_path);

    let output = Command::new("git")
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
    let staged = Command::new("git")
        .args(["diff", "--cached", "--quiet"])
        .current_dir(&project_path)
        .status()
        .map_err(|e| format!("Failed to execute git diff --cached: {}", e))?;

    // Check for unstaged changes
    let unstaged = Command::new("git")
        .args(["diff", "--quiet"])
        .current_dir(&project_path)
        .status()
        .map_err(|e| format!("Failed to execute git diff: {}", e))?;

    // Check for untracked files
    let untracked = Command::new("git")
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
    let clean_output = Command::new("git")
        .args(["clean", "-fd"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git clean: {}", e))?;

    if !clean_output.status.success() {
        let stderr = String::from_utf8_lossy(&clean_output.stderr);
        log::warn!("git clean warning: {}", stderr);
    }

    // Then reset to the specified commit
    let reset_output = Command::new("git")
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
    let log_output = Command::new("git")
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
    let diff_stat = Command::new("git")
        .args(["diff", "--stat", &target_commit_sha, "HEAD"])
        .current_dir(&project_path)
        .output()
        .map_err(|e| format!("Failed to execute git diff --stat: {}", e))?;

    let stat_output = String::from_utf8_lossy(&diff_stat.stdout).to_string();

    // Get list of changed files
    let diff_files = Command::new("git")
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
