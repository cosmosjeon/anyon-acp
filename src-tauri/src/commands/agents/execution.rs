use log::{debug, error, info, warn};
use rusqlite::{params, Connection};
use serde_json::Value as JsonValue;
use std::process::Stdio;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader as TokioBufReader};
use tokio::process::Command;

use super::database::get_agent;
use super::types::AgentDb;

/// Finds the full path to the claude binary
/// This is necessary because macOS apps have a limited PATH environment
fn find_claude_binary(app_handle: &AppHandle) -> Result<String, String> {
    crate::claude_binary::find_claude_binary(app_handle)
}

/// Helper function to create a tokio Command with proper environment variables
/// This ensures commands like Claude can find Node.js and other dependencies
fn create_command_with_env(program: &str) -> Command {
    crate::claude_binary::create_tokio_command_with_env(program)
}

/// Creates a system binary command for agent execution
fn create_agent_system_command(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
) -> Command {
    let mut cmd = create_command_with_env(claude_path);

    // Add all arguments
    for arg in args {
        cmd.arg(arg);
    }

    cmd.current_dir(project_path)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    cmd
}

/// Shared state for process IO handling
struct ProcessIoState {
    session_id: std::sync::Arc<Mutex<String>>,
    live_output: std::sync::Arc<Mutex<String>>,
    first_output: std::sync::Arc<std::sync::atomic::AtomicBool>,
    first_error: std::sync::Arc<std::sync::atomic::AtomicBool>,
    start_time: std::time::Instant,
}

impl ProcessIoState {
    fn new() -> Self {
        Self {
            session_id: std::sync::Arc::new(Mutex::new(String::new())),
            live_output: std::sync::Arc::new(Mutex::new(String::new())),
            first_output: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
            first_error: std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false)),
            start_time: std::time::Instant::now(),
        }
    }
}

/// Creates and spawns the Claude process, returning PID and IO handles
async fn create_and_spawn_process(
    claude_path: &str,
    args: Vec<String>,
    project_path: &str,
    run_id: i64,
    db: &State<'_, AgentDb>,
) -> Result<(tokio::process::Child, u32, std::path::PathBuf), String> {
    // Build the command
    let mut cmd = create_agent_system_command(claude_path, args, project_path);

    // Spawn the process
    info!("🚀 Spawning Claude system process...");
    let child = cmd.spawn().map_err(|e| {
        error!("❌ Failed to spawn Claude process: {}", e);
        format!("Failed to spawn Claude: {}", e)
    })?;

    info!("🔌 Using Stdio::null() for stdin - no input expected");

    // Get the PID
    let pid = child.id().unwrap_or(0);
    let now = chrono::Utc::now().to_rfc3339();
    info!("✅ Claude process spawned successfully with PID: {}", pid);

    // Update the database with PID and status
    let db_path = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE agent_runs SET status = 'running', pid = ?1, process_started_at = ?2 WHERE id = ?3",
            params![pid as i64, now, run_id],
        ).map_err(|e| e.to_string())?;
        info!("📝 Updated database with running status and PID");

        // Get db_path before dropping conn
        let path_str = conn.path().ok_or("Failed to get database path")?;
        std::path::PathBuf::from(path_str)
    };

    Ok((child, pid, db_path))
}

/// Sets up stdout and stderr IO handlers
fn setup_io_handlers(
    child: &mut tokio::process::Child,
) -> Result<
    (
        TokioBufReader<tokio::process::ChildStdout>,
        TokioBufReader<tokio::process::ChildStderr>,
    ),
    String,
> {
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to get stderr")?;
    info!("📡 Set up stdout/stderr readers");

    let stdout_reader = TokioBufReader::new(stdout);
    let stderr_reader = TokioBufReader::new(stderr);

    Ok((stdout_reader, stderr_reader))
}

/// Spawns the stdout reading task
fn spawn_stdout_reader(
    stdout_reader: TokioBufReader<tokio::process::ChildStdout>,
    app: AppHandle,
    run_id: i64,
    db_path: std::path::PathBuf,
    io_state: &ProcessIoState,
    registry: std::sync::Arc<crate::process::ProcessRegistry>,
) -> tokio::task::JoinHandle<()> {
    let session_id_clone = io_state.session_id.clone();
    let live_output_clone = io_state.live_output.clone();
    let first_output_clone = io_state.first_output.clone();

    tokio::spawn(async move {
        info!("📖 Starting to read Claude stdout...");
        let mut lines = stdout_reader.lines();
        let mut line_count = 0;

        while let Ok(Some(line)) = lines.next_line().await {
            line_count += 1;

            // Log first output
            if !first_output_clone.load(std::sync::atomic::Ordering::Relaxed) {
                info!(
                    "🎉 First output received from Claude process! Line: {}",
                    line
                );
                first_output_clone.store(true, std::sync::atomic::Ordering::Relaxed);
            }

            if line_count <= 5 {
                info!("stdout[{}]: {}", line_count, line);
            } else {
                debug!("stdout[{}]: {}", line_count, line);
            }

            // Store live output in both local buffer and registry
            if let Ok(mut output) = live_output_clone.lock() {
                output.push_str(&line);
                output.push('\n');
            }

            // Also store in process registry for cross-session access
            let _ = registry.append_live_output(run_id, &line);

            // Extract session ID from JSONL output
            if let Ok(json) = serde_json::from_str::<JsonValue>(&line) {
                // Claude Code uses "session_id" (underscore), not "sessionId"
                if json.get("type").and_then(|t| t.as_str()) == Some("system")
                    && json.get("subtype").and_then(|s| s.as_str()) == Some("init")
                {
                    if let Some(sid) = json.get("session_id").and_then(|s| s.as_str()) {
                        if let Ok(mut current_session_id) = session_id_clone.lock() {
                            if current_session_id.is_empty() {
                                *current_session_id = sid.to_string();
                                info!("🔑 Extracted session ID: {}", sid);

                                // Update database immediately with session ID
                                if let Ok(conn) = Connection::open(&db_path) {
                                    match conn.execute(
                                        "UPDATE agent_runs SET session_id = ?1 WHERE id = ?2",
                                        params![sid, run_id],
                                    ) {
                                        Ok(rows) => {
                                            if rows > 0 {
                                                info!("✅ Updated agent run {} with session ID immediately", run_id);
                                            }
                                        }
                                        Err(e) => {
                                            error!(
                                                "❌ Failed to update session ID immediately: {}",
                                                e
                                            );
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Emit the line to the frontend with run_id for isolation
            let _ = app.emit(&format!("agent-output:{}", run_id), &line);
            // Also emit to the generic event for backward compatibility
            let _ = app.emit("agent-output", &line);
        }

        info!(
            "📖 Finished reading Claude stdout. Total lines: {}",
            line_count
        );
    })
}

/// Spawns the stderr reading task
fn spawn_stderr_reader(
    stderr_reader: TokioBufReader<tokio::process::ChildStderr>,
    app: AppHandle,
    run_id: i64,
    io_state: &ProcessIoState,
) -> tokio::task::JoinHandle<()> {
    let first_error_clone = io_state.first_error.clone();

    tokio::spawn(async move {
        info!("📖 Starting to read Claude stderr...");
        let mut lines = stderr_reader.lines();
        let mut error_count = 0;

        while let Ok(Some(line)) = lines.next_line().await {
            error_count += 1;

            // Log first error
            if !first_error_clone.load(std::sync::atomic::Ordering::Relaxed) {
                warn!("⚠️ First error output from Claude process! Line: {}", line);
                first_error_clone.store(true, std::sync::atomic::Ordering::Relaxed);
            }

            error!("stderr[{}]: {}", error_count, line);
            // Emit error lines to the frontend with run_id for isolation
            let _ = app.emit(&format!("agent-error:{}", run_id), &line);
            // Also emit to the generic event for backward compatibility
            let _ = app.emit("agent-error", &line);
        }

        if error_count > 0 {
            warn!(
                "📖 Finished reading Claude stderr. Total error lines: {}",
                error_count
            );
        } else {
            info!("📖 Finished reading Claude stderr. No errors.");
        }
    })
}

/// Spawns the process monitoring task
fn spawn_process_monitor(
    app: AppHandle,
    run_id: i64,
    pid: u32,
    db_path: std::path::PathBuf,
    io_state: ProcessIoState,
    stdout_task: tokio::task::JoinHandle<()>,
    stderr_task: tokio::task::JoinHandle<()>,
) {
    tokio::spawn(async move {
        info!("🕐 Starting process monitoring...");

        // Wait for first output with timeout
        for i in 0..300 {
            // 30 seconds (300 * 100ms)
            if io_state
                .first_output
                .load(std::sync::atomic::Ordering::Relaxed)
            {
                info!(
                    "✅ Output detected after {}ms, continuing normal execution",
                    i * 100
                );
                break;
            }

            if i == 299 {
                warn!("⏰ TIMEOUT: No output from Claude process after 30 seconds");
                warn!("💡 This usually means:");
                warn!("   1. Claude process is waiting for user input");
                warn!("   3. Claude failed to initialize but didn't report an error");
                warn!("   4. Network connectivity issues");
                warn!("   5. Authentication issues (API key not found/invalid)");

                // Process timed out - kill it via PID
                warn!(
                    "🔍 Process likely stuck waiting for input, attempting to kill PID: {}",
                    pid
                );
                let kill_result = std::process::Command::new("kill")
                    .arg("-TERM")
                    .arg(pid.to_string())
                    .output();

                match kill_result {
                    Ok(output) if output.status.success() => {
                        warn!("🔍 Successfully sent TERM signal to process");
                    }
                    Ok(_) => {
                        warn!("🔍 Failed to kill process with TERM, trying KILL");
                        let _ = std::process::Command::new("kill")
                            .arg("-KILL")
                            .arg(pid.to_string())
                            .output();
                    }
                    Err(e) => {
                        warn!("🔍 Error killing process: {}", e);
                    }
                }

                // Update database
                if let Ok(conn) = Connection::open(&db_path) {
                    let _ = conn.execute(
                        "UPDATE agent_runs SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = ?1",
                        params![run_id],
                    );
                }

                let _ = app.emit("agent-complete", false);
                let _ = app.emit(&format!("agent-complete:{}", run_id), false);
                return;
            }

            tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        }

        // Wait for reading tasks to complete
        info!("⏳ Waiting for stdout/stderr reading to complete...");
        let _ = stdout_task.await;
        let _ = stderr_task.await;

        let duration_ms = io_state.start_time.elapsed().as_millis() as i64;
        info!("⏱️ Process execution took {} ms", duration_ms);

        // Get the session ID that was extracted
        let extracted_session_id = if let Ok(sid) = io_state.session_id.lock() {
            sid.clone()
        } else {
            String::new()
        };

        // Wait for process completion and update status
        info!("✅ Claude process execution monitoring complete");

        // Update the run record with session ID and mark as completed - open a new connection
        if let Ok(conn) = Connection::open(&db_path) {
            info!(
                "🔄 Updating database with extracted session ID: {}",
                extracted_session_id
            );
            match conn.execute(
                "UPDATE agent_runs SET session_id = ?1, status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?2",
                params![extracted_session_id, run_id],
            ) {
                Ok(rows_affected) => {
                    if rows_affected > 0 {
                        info!("✅ Successfully updated agent run {} with session ID: {}", run_id, extracted_session_id);
                    } else {
                        warn!("⚠️ No rows affected when updating agent run {} with session ID", run_id);
                    }
                }
                Err(e) => {
                    error!("❌ Failed to update agent run {} with session ID: {}", run_id, e);
                }
            }
        } else {
            error!(
                "❌ Failed to open database to update session ID for run {}",
                run_id
            );
        }

        // Cleanup will be handled by the cleanup_finished_processes function

        let _ = app.emit("agent-complete", true);
        let _ = app.emit(&format!("agent-complete:{}", run_id), true);
    });
}

/// Spawn agent using system binary command
async fn spawn_agent_system(
    app: AppHandle,
    run_id: i64,
    agent_id: i64,
    agent_name: String,
    claude_path: String,
    args: Vec<String>,
    project_path: String,
    task: String,
    execution_model: String,
    db: State<'_, AgentDb>,
    registry: State<'_, crate::process::ProcessRegistryState>,
) -> Result<i64, String> {
    // Create and spawn the process
    let (mut child, pid, db_path) =
        create_and_spawn_process(&claude_path, args, &project_path, run_id, &db).await?;

    // Set up IO handlers
    let (stdout_reader, stderr_reader) = setup_io_handlers(&mut child)?;

    // Create shared IO state
    let io_state = ProcessIoState::new();

    // Spawn stdout reader task
    let stdout_task = spawn_stdout_reader(
        stdout_reader,
        app.clone(),
        run_id,
        db_path.clone(),
        &io_state,
        registry.0.clone(),
    );

    // Spawn stderr reader task
    let stderr_task = spawn_stderr_reader(stderr_reader, app.clone(), run_id, &io_state);

    // Register the process in the registry for live output tracking (after stdout/stderr setup)
    registry
        .0
        .register_process(
            run_id,
            agent_id,
            agent_name,
            pid,
            project_path.clone(),
            task.clone(),
            execution_model.clone(),
            child,
        )
        .map_err(|e| format!("Failed to register process: {}", e))?;
    info!("📋 Registered process in registry");

    // Spawn process monitor task
    spawn_process_monitor(
        app,
        run_id,
        pid,
        db_path,
        io_state,
        stdout_task,
        stderr_task,
    );

    Ok(run_id)
}

/// Execute a CC agent with streaming output
#[tauri::command]
pub async fn execute_agent(
    app: AppHandle,
    agent_id: i64,
    project_path: String,
    task: String,
    model: Option<String>,
    db: State<'_, AgentDb>,
    registry: State<'_, crate::process::ProcessRegistryState>,
) -> Result<i64, String> {
    info!("Executing agent {} with task: {}", agent_id, task);

    // Get the agent from database
    let agent = get_agent(db.clone(), agent_id).await?;
    let execution_model = model.unwrap_or(agent.model.clone());

    // Create .claude/settings.json with agent hooks if it doesn't exist
    if let Some(hooks_json) = &agent.hooks {
        let claude_dir = std::path::Path::new(&project_path).join(".claude");
        let settings_path = claude_dir.join("settings.json");

        // Create .claude directory if it doesn't exist
        if !claude_dir.exists() {
            std::fs::create_dir_all(&claude_dir)
                .map_err(|e| format!("Failed to create .claude directory: {}", e))?;
            info!("Created .claude directory at: {:?}", claude_dir);
        }

        // Check if settings.json already exists
        if !settings_path.exists() {
            // Parse the hooks JSON
            let hooks: serde_json::Value = serde_json::from_str(hooks_json)
                .map_err(|e| format!("Failed to parse agent hooks: {}", e))?;

            // Create a settings object with just the hooks
            let settings = serde_json::json!({
                "hooks": hooks
            });

            // Write the settings file
            let settings_content = serde_json::to_string_pretty(&settings)
                .map_err(|e| format!("Failed to serialize settings: {}", e))?;

            std::fs::write(&settings_path, settings_content)
                .map_err(|e| format!("Failed to write settings.json: {}", e))?;

            info!(
                "Created settings.json with agent hooks at: {:?}",
                settings_path
            );
        } else {
            info!("settings.json already exists at: {:?}", settings_path);
        }
    }

    // Create a new run record
    let run_id = {
        let conn = db.0.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT INTO agent_runs (agent_id, agent_name, agent_icon, task, model, project_path, session_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![agent_id, agent.name, agent.icon, task, execution_model, project_path, ""],
        )
        .map_err(|e| e.to_string())?;
        conn.last_insert_rowid()
    };

    // Find Claude binary
    info!("Running agent '{}'", agent.name);
    let claude_path = match find_claude_binary(&app) {
        Ok(path) => path,
        Err(e) => {
            error!("Failed to find claude binary: {}", e);
            return Err(e);
        }
    };

    // Build arguments
    let args = vec![
        "-p".to_string(),
        task.clone(),
        "--system-prompt".to_string(),
        agent.system_prompt.clone(),
        "--model".to_string(),
        execution_model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--verbose".to_string(),
        "--dangerously-skip-permissions".to_string(),
    ];

    // Always use system binary execution (sidecar removed)
    spawn_agent_system(
        app,
        run_id,
        agent_id,
        agent.name.clone(),
        claude_path,
        args,
        project_path,
        task,
        execution_model,
        db,
        registry,
    )
    .await
}
