use std::collections::HashMap;
use std::sync::Arc;
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

use super::helpers::{find_claude_binary, create_system_command};
use super::shared::ClaudeProcessState;

#[tauri::command]
pub async fn execute_claude_code(
    app: AppHandle,
    project_path: String,
    prompt: String,
    model: String,
    execution_mode: Option<String>,
) -> Result<(), String> {
    log::info!(
        "Starting new Claude Code session in: {} with model: {}, execution_mode: {:?}",
        project_path,
        model,
        execution_mode
    );

    let claude_path = find_claude_binary(&app)?;

    let mut args = vec![
        "-p".to_string(),
        prompt.clone(),
        "--model".to_string(),
        model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--include-partial-messages".to_string(),
        "--verbose".to_string(),
    ];

    // Add permission mode based on execution_mode
    if execution_mode.as_deref() == Some("plan") {
        args.push("--permission-mode".to_string());
        args.push("plan".to_string());
    } else {
        args.push("--dangerously-skip-permissions".to_string());
    }

    let cmd = create_system_command(&claude_path, args, &project_path);
    spawn_claude_process(app, cmd, prompt, model, project_path).await
}

#[tauri::command]
pub async fn continue_claude_code(
    app: AppHandle,
    project_path: String,
    prompt: String,
    model: String,
    execution_mode: Option<String>,
) -> Result<(), String> {
    log::info!(
        "Continuing Claude Code conversation in: {} with model: {}, execution_mode: {:?}",
        project_path,
        model,
        execution_mode
    );

    let claude_path = find_claude_binary(&app)?;

    let mut args = vec![
        "-c".to_string(), // Continue flag
        "-p".to_string(),
        prompt.clone(),
        "--model".to_string(),
        model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--include-partial-messages".to_string(),
        "--verbose".to_string(),
    ];

    // Add permission mode based on execution_mode
    if execution_mode.as_deref() == Some("plan") {
        args.push("--permission-mode".to_string());
        args.push("plan".to_string());
    } else {
        args.push("--dangerously-skip-permissions".to_string());
    }

    let cmd = create_system_command(&claude_path, args, &project_path);
    spawn_claude_process(app, cmd, prompt, model, project_path).await
}

#[tauri::command]
pub async fn resume_claude_code(
    app: AppHandle,
    project_path: String,
    session_id: String,
    prompt: String,
    model: String,
    execution_mode: Option<String>,
) -> Result<(), String> {
    log::info!(
        "Resuming Claude Code session: {} in: {} with model: {}, execution_mode: {:?}",
        session_id,
        project_path,
        model,
        execution_mode
    );

    let claude_path = find_claude_binary(&app)?;

    let mut args = vec![
        "--resume".to_string(),
        session_id.clone(),
        "-p".to_string(),
        prompt.clone(),
        "--model".to_string(),
        model.clone(),
        "--output-format".to_string(),
        "stream-json".to_string(),
        "--include-partial-messages".to_string(),
        "--verbose".to_string(),
    ];

    // Add permission mode based on execution_mode
    if execution_mode.as_deref() == Some("plan") {
        args.push("--permission-mode".to_string());
        args.push("plan".to_string());
    } else {
        args.push("--dangerously-skip-permissions".to_string());
    }

    let cmd = create_system_command(&claude_path, args, &project_path);
    spawn_claude_process(app, cmd, prompt, model, project_path).await
}

#[tauri::command]
pub async fn cancel_claude_execution(
    app: AppHandle,
    session_id: Option<String>,
) -> Result<(), String> {
    log::info!(
        "Cancelling Claude Code execution for session: {:?}",
        session_id
    );

    let mut killed = false;
    let mut attempted_methods = Vec::new();

    // Method 1: Try to find and kill via ProcessRegistry using session ID
    if let Some(sid) = &session_id {
        let registry = app.state::<crate::process::ProcessRegistryState>();
        match registry.0.get_claude_session_by_id(sid) {
            Ok(Some(process_info)) => {
                log::info!(
                    "Found process in registry for session {}: run_id={}, PID={}",
                    sid,
                    process_info.run_id,
                    process_info.pid
                );
                match registry.0.kill_process(process_info.run_id).await {
                    Ok(success) => {
                        if success {
                            log::info!("Successfully killed process via registry");
                            killed = true;
                        } else {
                            log::warn!("Registry kill returned false");
                        }
                    }
                    Err(e) => {
                        log::warn!("Failed to kill via registry: {}", e);
                    }
                }
                attempted_methods.push("registry");
            }
            Ok(None) => {
                log::warn!("Session {} not found in ProcessRegistry", sid);
            }
            Err(e) => {
                log::error!("Error querying ProcessRegistry: {}", e);
            }
        }
    }

    // Method 2: Try the legacy approach via ClaudeProcessState
    if !killed {
        let claude_state = app.state::<ClaudeProcessState>();
        let mut current_process = claude_state.current_process.lock().await;

        if let Some(mut child) = current_process.take() {
            // Try to get the PID before killing
            let pid = child.id();
            log::info!(
                "Attempting to kill Claude process via ClaudeProcessState with PID: {:?}",
                pid
            );

            // Kill the process
            match child.kill().await {
                Ok(_) => {
                    log::info!("Successfully killed Claude process via ClaudeProcessState");
                    killed = true;
                }
                Err(e) => {
                    log::error!(
                        "Failed to kill Claude process via ClaudeProcessState: {}",
                        e
                    );

                    // Method 3: If we have a PID, try system kill as last resort
                    if let Some(pid) = pid {
                        log::info!("Attempting system kill as last resort for PID: {}", pid);
                        let kill_result = if cfg!(target_os = "windows") {
                            std::process::Command::new("taskkill")
                                .args(["/F", "/PID", &pid.to_string()])
                                .output()
                        } else {
                            std::process::Command::new("kill")
                                .args(["-KILL", &pid.to_string()])
                                .output()
                        };

                        match kill_result {
                            Ok(output) if output.status.success() => {
                                log::info!("Successfully killed process via system command");
                                killed = true;
                            }
                            Ok(output) => {
                                let stderr = String::from_utf8_lossy(&output.stderr);
                                log::error!("System kill failed: {}", stderr);
                            }
                            Err(e) => {
                                log::error!("Failed to execute system kill command: {}", e);
                            }
                        }
                    }
                }
            }
            attempted_methods.push("claude_state");
        } else {
            log::warn!("No active Claude process in ClaudeProcessState");
        }
    }

    if !killed && attempted_methods.is_empty() {
        log::warn!("No active Claude process found to cancel");
    }

    // Always emit cancellation events for UI consistency
    if let Some(sid) = session_id {
        let _ = app.emit(&format!("claude-cancelled:{}", sid), true);
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        let _ = app.emit(&format!("claude-complete:{}", sid), false);
    }

    // Also emit generic events for backward compatibility
    let _ = app.emit("claude-cancelled", true);
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    let _ = app.emit("claude-complete", false);

    if killed {
        log::info!("Claude process cancellation completed successfully");
    } else if !attempted_methods.is_empty() {
        log::warn!("Claude process cancellation attempted but process may have already exited. Attempted methods: {:?}", attempted_methods);
    }

    Ok(())
}

#[tauri::command]
pub async fn list_running_claude_sessions(
    registry: tauri::State<'_, crate::process::ProcessRegistryState>,
) -> Result<Vec<crate::process::ProcessInfo>, String> {
    registry.0.get_running_claude_sessions()
}

#[tauri::command]
pub async fn get_claude_session_output(
    registry: tauri::State<'_, crate::process::ProcessRegistryState>,
    session_id: String,
) -> Result<String, String> {
    // Find the process by session ID
    if let Some(process_info) = registry.0.get_claude_session_by_id(&session_id)? {
        registry.0.get_live_output(process_info.run_id)
    } else {
        Ok(String::new())
    }
}

async fn spawn_claude_process(
    app: AppHandle,
    mut cmd: Command,
    prompt: String,
    model: String,
    project_path: String,
) -> Result<(), String> {
    use std::sync::Mutex;
    use tokio::io::{AsyncBufReadExt, BufReader};

    // Spawn the process
    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to spawn Claude: {}", e))?;

    // Get stdout and stderr
    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to get stderr")?;

    // Get the child PID for logging
    let pid = child.id().unwrap_or(0);
    log::info!("Spawned Claude process with PID: {:?}", pid);

    // Create readers first (before moving child)
    let stdout_reader = BufReader::new(stdout);
    let stderr_reader = BufReader::new(stderr);

    // We'll extract the session ID from Claude's init message
    let session_id_holder: Arc<Mutex<Option<String>>> = Arc::new(Mutex::new(None));
    let run_id_holder: Arc<Mutex<Option<i64>>> = Arc::new(Mutex::new(None));

    // Store the child process in the global state (for backward compatibility)
    let claude_state = app.state::<ClaudeProcessState>();
    {
        let mut current_process = claude_state.current_process.lock().await;
        // If there's already a process running, kill it first
        if let Some(mut existing_child) = current_process.take() {
            log::warn!("Killing existing Claude process before starting new one");
            let _ = existing_child.kill().await;
        }
        *current_process = Some(child);
    }

    // Spawn tasks to read stdout and stderr
    let app_handle = app.clone();
    let session_id_holder_clone = session_id_holder.clone();
    let run_id_holder_clone = run_id_holder.clone();
    let registry = app.state::<crate::process::ProcessRegistryState>();
    let registry_clone = registry.0.clone();
    let project_path_clone = project_path.clone();
    let prompt_clone = prompt.clone();
    let model_clone = model.clone();
    let stdout_task = tokio::spawn(async move {
        let mut lines = stdout_reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            log::debug!("Claude stdout: {}", line);

            // Parse the line to check for init message with session ID
            if let Ok(msg) = serde_json::from_str::<serde_json::Value>(&line) {
                if msg["type"] == "system" && msg["subtype"] == "init" {
                    if let Some(claude_session_id) = msg["session_id"].as_str() {
                        let mut session_id_guard = session_id_holder_clone.lock().unwrap();
                        if session_id_guard.is_none() {
                            *session_id_guard = Some(claude_session_id.to_string());
                            log::info!("Extracted Claude session ID: {}", claude_session_id);

                            // Now register with ProcessRegistry using Claude's session ID
                            match registry_clone.register_claude_session(
                                claude_session_id.to_string(),
                                pid,
                                project_path_clone.clone(),
                                prompt_clone.clone(),
                                model_clone.clone(),
                            ) {
                                Ok(run_id) => {
                                    log::info!("Registered Claude session with run_id: {}", run_id);
                                    let mut run_id_guard = run_id_holder_clone.lock().unwrap();
                                    *run_id_guard = Some(run_id);
                                }
                                Err(e) => {
                                    log::error!("Failed to register Claude session: {}", e);
                                }
                            }
                        }
                    }
                }
            }

            // Store live output in registry if we have a run_id
            if let Some(run_id) = *run_id_holder_clone.lock().unwrap() {
                let _ = registry_clone.append_live_output(run_id, &line);
            }

            // Emit the line to the frontend with session isolation if we have session ID
            if let Some(ref session_id) = *session_id_holder_clone.lock().unwrap() {
                let _ = app_handle.emit(&format!("claude-output:{}", session_id), &line);
            }
            // Also emit to the generic event for backward compatibility
            let _ = app_handle.emit("claude-output", &line);
        }
    });

    let app_handle_stderr = app.clone();
    let session_id_holder_clone2 = session_id_holder.clone();
    let stderr_task = tokio::spawn(async move {
        let mut lines = stderr_reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            log::error!("Claude stderr: {}", line);
            // Emit error lines to the frontend with session isolation if we have session ID
            if let Some(ref session_id) = *session_id_holder_clone2.lock().unwrap() {
                let _ = app_handle_stderr.emit(&format!("claude-error:{}", session_id), &line);
            }
            // Also emit to the generic event for backward compatibility
            let _ = app_handle_stderr.emit("claude-error", &line);
        }
    });

    // Wait for the process to complete
    let app_handle_wait = app.clone();
    let claude_state_wait = claude_state.current_process.clone();
    let session_id_holder_clone3 = session_id_holder.clone();
    let run_id_holder_clone2 = run_id_holder.clone();
    let registry_clone2 = registry.0.clone();
    let project_path_for_routing = project_path.clone();
    let prompt_for_routing = prompt.clone();
    let model_for_routing = model.clone();
    tokio::spawn(async move {
        let _ = stdout_task.await;
        let _ = stderr_task.await;

        // Get the child from the state to wait on it
        let mut current_process = claude_state_wait.lock().await;
        if let Some(mut child) = current_process.take() {
            match child.wait().await {
                Ok(status) => {
                    log::info!("Claude process exited with status: {}", status);

                    // === Dev workflow auto-routing ===
                    // Use a blocking thread spawn to avoid Send trait issues
                    let app_for_routing = app_handle_wait.clone();
                    let project_for_routing = project_path_for_routing.clone();
                    let prompt_str = prompt_for_routing.clone();
                    let model_str = model_for_routing.clone();
                    let success = status.success();
                    std::thread::spawn(move || {
                        tauri::async_runtime::block_on(async move {
                            if let Err(e) = crate::commands::dev_workflow::on_claude_complete(
                                &app_for_routing,
                                &project_for_routing,
                                &prompt_str,
                                success,
                                &model_str,
                            )
                            .await
                            {
                                log::error!("Dev workflow auto-routing failed: {}", e);
                            }
                        });
                    });
                    // === End auto-routing ===

                    // Add a small delay to ensure all messages are processed
                    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                    if let Some(ref session_id) = *session_id_holder_clone3.lock().unwrap() {
                        let _ = app_handle_wait
                            .emit(&format!("claude-complete:{}", session_id), status.success());
                    }
                    // Also emit to the generic event for backward compatibility
                    let _ = app_handle_wait.emit("claude-complete", status.success());
                }
                Err(e) => {
                    log::error!("Failed to wait for Claude process: {}", e);
                    // Add a small delay to ensure all messages are processed
                    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                    if let Some(ref session_id) = *session_id_holder_clone3.lock().unwrap() {
                        let _ =
                            app_handle_wait.emit(&format!("claude-complete:{}", session_id), false);
                    }
                    // Also emit to the generic event for backward compatibility
                    let _ = app_handle_wait.emit("claude-complete", false);
                }
            }
        }

        // Unregister from ProcessRegistry if we have a run_id
        if let Some(run_id) = *run_id_holder_clone2.lock().unwrap() {
            let _ = registry_clone2.unregister_process(run_id);
        }

        // Clear the process from state
        *current_process = None;
    });

    Ok(())
}
