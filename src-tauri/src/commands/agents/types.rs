use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::sync::Mutex;

/// Represents a CC Agent stored in the database
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Agent {
    pub id: Option<i64>,
    pub name: String,
    pub icon: String,
    pub system_prompt: String,
    pub default_task: Option<String>,
    pub model: String,
    pub enable_file_read: bool,
    pub enable_file_write: bool,
    pub enable_network: bool,
    pub hooks: Option<String>, // JSON string of hooks configuration
    pub created_at: String,
    pub updated_at: String,
}

/// Represents an agent execution run
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentRun {
    pub id: Option<i64>,
    pub agent_id: i64,
    pub agent_name: String,
    pub agent_icon: String,
    pub task: String,
    pub model: String,
    pub project_path: String,
    pub session_id: String, // UUID session ID from Claude Code
    pub status: String,     // 'pending', 'running', 'completed', 'failed', 'cancelled'
    pub pid: Option<u32>,
    pub process_started_at: Option<String>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

/// Represents runtime metrics calculated from JSONL
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentRunMetrics {
    pub duration_ms: Option<i64>,
    pub total_tokens: Option<i64>,
    pub cost_usd: Option<f64>,
    pub message_count: Option<i64>,
}

/// Combined agent run with real-time metrics
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgentRunWithMetrics {
    #[serde(flatten)]
    pub run: AgentRun,
    pub metrics: Option<AgentRunMetrics>,
    pub output: Option<String>, // Real-time JSONL content
}

/// Agent export format
#[derive(Debug, Serialize, Deserialize)]
pub struct AgentExport {
    pub version: u32,
    pub exported_at: String,
    pub agent: AgentData,
}

/// Agent data within export
#[derive(Debug, Serialize, Deserialize)]
pub struct AgentData {
    pub name: String,
    pub icon: String,
    pub system_prompt: String,
    pub default_task: Option<String>,
    pub model: String,
    pub hooks: Option<String>,
}

/// Database connection state
pub struct AgentDb(pub Mutex<Connection>);

/// Represents a GitHub agent file from the API
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GitHubAgentFile {
    pub name: String,
    pub path: String,
    pub download_url: String,
    pub size: i64,
    pub sha: String,
}

/// Represents the GitHub API response for directory contents
#[derive(Debug, Deserialize)]
pub(crate) struct GitHubApiResponse {
    pub name: String,
    pub path: String,
    pub sha: String,
    pub size: i64,
    pub download_url: Option<String>,
    #[serde(rename = "type")]
    pub file_type: String,
}

/// Real-time JSONL reading and processing functions
impl AgentRunMetrics {
    /// Calculate metrics from JSONL content
    pub fn from_jsonl(jsonl_content: &str) -> Self {
        let mut total_tokens = 0i64;
        let mut cost_usd = 0.0f64;
        let mut message_count = 0i64;
        let mut start_time: Option<chrono::DateTime<chrono::Utc>> = None;
        let mut end_time: Option<chrono::DateTime<chrono::Utc>> = None;

        for line in jsonl_content.lines() {
            if let Ok(json) = serde_json::from_str::<JsonValue>(line) {
                message_count += 1;

                // Track timestamps
                if let Some(timestamp_str) = json.get("timestamp").and_then(|t| t.as_str()) {
                    if let Ok(timestamp) = chrono::DateTime::parse_from_rfc3339(timestamp_str) {
                        let utc_time = timestamp.with_timezone(&chrono::Utc);
                        if start_time.is_none() || utc_time < start_time.unwrap() {
                            start_time = Some(utc_time);
                        }
                        if end_time.is_none() || utc_time > end_time.unwrap() {
                            end_time = Some(utc_time);
                        }
                    }
                }

                // Extract token usage - check both top-level and nested message.usage
                let usage = json
                    .get("usage")
                    .or_else(|| json.get("message").and_then(|m| m.get("usage")));

                if let Some(usage) = usage {
                    if let Some(input_tokens) = usage.get("input_tokens").and_then(|t| t.as_i64()) {
                        total_tokens += input_tokens;
                    }
                    if let Some(output_tokens) = usage.get("output_tokens").and_then(|t| t.as_i64())
                    {
                        total_tokens += output_tokens;
                    }
                }

                // Extract cost information
                if let Some(cost) = json.get("cost").and_then(|c| c.as_f64()) {
                    cost_usd += cost;
                }
            }
        }

        let duration_ms = match (start_time, end_time) {
            (Some(start), Some(end)) => Some((end - start).num_milliseconds()),
            _ => None,
        };

        Self {
            duration_ms,
            total_tokens: if total_tokens > 0 {
                Some(total_tokens)
            } else {
                None
            },
            cost_usd: if cost_usd > 0.0 { Some(cost_usd) } else { None },
            message_count: if message_count > 0 {
                Some(message_count)
            } else {
                None
            },
        }
    }
}
