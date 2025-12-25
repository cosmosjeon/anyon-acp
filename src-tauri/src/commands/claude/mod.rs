//! Claude commands module
//!
//! This module contains all Tauri commands related to Claude Code integration.
//!
//! The module is organized into the following submodules:
//! - `shared`: Common types and structures used across modules
//! - `helpers`: Internal helper functions
//! - `projects`: Project management (list, create, get sessions)
//! - `sessions`: Session management (open, load history)
//! - `execution`: Claude process execution (execute, continue, resume, cancel)
//! - `filesystem`: File operations (list, search, read)
//! - `settings`: Settings and configuration (Claude settings, system prompt, git operations)

// Submodules
mod shared;
mod helpers;
pub mod projects;
pub mod sessions;
pub mod execution;
pub mod filesystem;
pub mod settings;

// Re-export shared types
pub use shared::{
    ClaudeProcessState, Project, Session, ClaudeSettings,
    ClaudeVersionStatus, ClaudeMdFile, FileEntry,
};

// Re-export all public functions

// Projects
pub use projects::{
    get_home_directory,
    list_projects,
    create_project,
    get_project_sessions,
};

// Sessions
pub use sessions::{
    open_new_session,
    load_session_history,
};

// Execution
pub use execution::{
    execute_claude_code,
    continue_claude_code,
    resume_claude_code,
    cancel_claude_execution,
    list_running_claude_sessions,
    get_claude_session_output,
};

// Filesystem
pub use filesystem::{
    list_directory_contents,
    search_files,
    read_file_content,
    write_file_content,
    check_file_exists,
    list_anyon_docs,
};

// Settings
pub use settings::{
    get_claude_settings,
    save_claude_settings,
    get_system_prompt,
    save_system_prompt,
    check_claude_version,
    find_claude_md_files,
    read_claude_md_file,
    save_claude_md_file,
    check_anyon_installed,
    run_npx_anyon_agents,
    check_is_git_repo,
    init_git_repo,
    git_add_all,
    git_commit,
    git_set_remote,
    git_push,
    git_status,
    git_current_branch,
};
