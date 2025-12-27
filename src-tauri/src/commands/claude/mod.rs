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
pub mod execution;
pub mod filesystem;
mod helpers;
pub mod projects;
pub mod sessions;
pub mod settings;
mod shared;

// Re-export shared types
pub use shared::{
    ClaudeMdFile, ClaudeProcessState, ClaudeSettings, ClaudeVersionStatus, FileEntry, Project,
    Session,
};

// Re-export all public functions

// Projects
pub use projects::{create_project, get_home_directory, get_project_sessions, list_projects};

// Sessions
pub use sessions::{load_session_history, open_new_session};

// Execution
pub use execution::{
    cancel_claude_execution, continue_claude_code, execute_claude_code, get_claude_session_output,
    list_running_claude_sessions, resume_claude_code,
};

// Filesystem
pub use filesystem::{
    check_file_exists, get_file_metadata, list_anyon_docs, list_directory_contents,
    read_file_content, search_files, write_file_content,
};

// Settings
pub use settings::{
    check_anyon_installed, check_claude_version, check_is_git_repo, find_claude_md_files,
    get_claude_settings, get_system_prompt, git_add_all, git_commit, git_current_branch, git_push,
    git_set_remote, git_status, init_git_repo, install_anyon_templates, read_claude_md_file,
    save_claude_md_file, save_claude_settings, save_system_prompt,
};
