use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub url: String,
    pub alive: bool,
}

#[tauri::command]
pub async fn scan_ports() -> Result<Vec<PortInfo>, String> {
    log::info!("scan_ports: Starting port scan...");
    let common_ports = vec![3000, 3001, 3002, 5173, 5174, 5175, 8080, 8000, 4200, 4321];

    let mut results = Vec::new();
    let mut alive_count = 0;

    for port in common_ports {
        let alive = check_port(port);
        if alive {
            alive_count += 1;
        }
        results.push(PortInfo {
            port,
            url: format!("http://localhost:{}", port),
            alive,
        });
    }

    log::info!("scan_ports: Completed. Found {} alive ports", alive_count);
    Ok(results)
}

fn check_port(port: u16) -> bool {
    let alive = TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_millis(1000), // Increased from 300ms for reliability
    )
    .is_ok();

    log::debug!("scan_ports: port {} - alive: {}", port, alive);
    alive
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortCheckResult {
    pub port: u16,
    pub alive: bool,
    pub attempts: u32,
    pub elapsed_ms: u64,
}

/// Check if a specific port is alive with optional polling.
///
/// This command polls the specified port until it's alive or max attempts are reached.
/// Useful for waiting for a server to start up.
///
/// # Arguments
/// * `port` - The port number to check
/// * `poll_interval_ms` - Interval between attempts in ms (default: 500)
/// * `max_attempts` - Maximum number of attempts (default: 10, so ~5 seconds total)
#[tauri::command]
pub async fn check_port_alive(
    port: u16,
    poll_interval_ms: Option<u64>,
    max_attempts: Option<u32>,
) -> Result<PortCheckResult, String> {
    let interval = poll_interval_ms.unwrap_or(500);
    let max = max_attempts.unwrap_or(10);
    let start = std::time::Instant::now();

    log::info!(
        "check_port_alive: Checking port {} (max {} attempts, {}ms interval)",
        port,
        max,
        interval
    );

    for attempt in 1..=max {
        if check_port(port) {
            let elapsed = start.elapsed().as_millis() as u64;
            log::info!(
                "check_port_alive: Port {} is alive after {} attempts ({}ms)",
                port,
                attempt,
                elapsed
            );
            return Ok(PortCheckResult {
                port,
                alive: true,
                attempts: attempt,
                elapsed_ms: elapsed,
            });
        }

        if attempt < max {
            tokio::time::sleep(tokio::time::Duration::from_millis(interval)).await;
        }
    }

    let elapsed = start.elapsed().as_millis() as u64;
    log::warn!(
        "check_port_alive: Port {} not responding after {} attempts ({}ms)",
        port,
        max,
        elapsed
    );

    Ok(PortCheckResult {
        port,
        alive: false,
        attempts: max,
        elapsed_ms: elapsed,
    })
}
