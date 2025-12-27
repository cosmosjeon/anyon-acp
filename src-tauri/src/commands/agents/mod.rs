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
pub mod database;
pub mod execution;
pub mod import_export;
pub mod session;
pub mod types;

// Re-export types
pub use types::{
    Agent, AgentData, AgentDb, AgentExport, AgentRun, AgentRunMetrics, AgentRunWithMetrics,
    GitHubAgentFile,
};

// Re-export database functions
pub use database::{
    cleanup_finished_processes, create_agent, delete_agent, get_agent, get_agent_run,
    get_claude_binary_path, init_database, list_agent_runs, list_agents, list_claude_installations,
    set_claude_binary_path, update_agent,
};

// Re-export execution functions
pub use execution::execute_agent;

// Re-export session functions
pub use session::{
    get_agent_run_with_metrics, get_agent_run_with_real_time_metrics, get_live_session_output,
    get_session_output, get_session_status, kill_agent_session, list_agent_runs_with_metrics,
    list_running_sessions, load_agent_session_history, read_session_jsonl, stream_session_output,
};

// Re-export import/export functions
pub use import_export::{
    export_agent, export_agent_to_file, fetch_github_agent_content, fetch_github_agents,
    import_agent, import_agent_from_file, import_agent_from_github,
};
