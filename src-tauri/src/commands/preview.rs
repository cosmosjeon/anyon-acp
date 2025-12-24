use std::net::TcpStream;
use std::time::Duration;
use serde::{Deserialize, Serialize};

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
        Duration::from_millis(1000)  // Increased from 300ms for reliability
    ).is_ok();

    log::debug!("scan_ports: port {} - alive: {}", port, alive);
    alive
}
