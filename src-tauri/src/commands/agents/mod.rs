//! Agents module
//!
//! This module contains all functionality related to CC Agents.
//!
//! The module is organized into the following submodules:
//! - `types`: Type definitions (Agent, AgentRun, AgentRunMetrics, etc.)
//! - `database`: Database operations (init, CRUD)
//! - `execution`: Agent execution and process management
//! - `session`: Session management and JSONL reading
//! - `import_export`: Import/export and GitHub integration

// Submodules
pub mod types;
pub mod database;
pub mod execution;
pub mod session;
pub mod import_export;

// Re-export types
pub use types::{
    Agent, AgentDb, AgentRun, AgentRunMetrics, AgentRunWithMetrics,
    AgentExport, AgentData, GitHubAgentFile,
};

// Re-export database functions
pub use database::{
    init_database,
    list_agents,
    create_agent,
    update_agent,
    delete_agent,
    get_agent,
    list_agent_runs,
    get_agent_run,
    cleanup_finished_processes,
    get_claude_binary_path,
    set_claude_binary_path,
    list_claude_installations,
};

// Re-export execution functions
pub use execution::execute_agent;

// Re-export session functions
pub use session::{
    read_session_jsonl,
    get_agent_run_with_metrics,
    get_agent_run_with_real_time_metrics,
    list_agent_runs_with_metrics,
    list_running_sessions,
    kill_agent_session,
    get_session_status,
    get_live_session_output,
    get_session_output,
    stream_session_output,
    load_agent_session_history,
};

// Re-export import/export functions
pub use import_export::{
    export_agent,
    export_agent_to_file,
    import_agent,
    import_agent_from_file,
    fetch_github_agents,
    fetch_github_agent_content,
    import_agent_from_github,
};
