# ANYON Dev Server Cleanup Script (Windows)
# Kills leftover Vite and Backend server processes

Write-Host ""
Write-Host "=== ANYON Dev Server Cleanup ===" -ForegroundColor Cyan
Write-Host ""

$killed = $false

# Kill Vite (port 1420)
$viteResult = netstat -ano | Select-String ":1420.*LISTENING"
if ($viteResult) {
    foreach ($line in $viteResult) {
        $parts = $line -split '\s+'
        $processId = $parts[-1]
        if ($processId -match '^\d+$') {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "[OK] Killed Vite process (PID: $processId, Port: 1420)" -ForegroundColor Green
                $killed = $true
            } catch {
                Write-Host "[WARN] Could not kill PID $processId : $_" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "[OK] Port 1420 is free" -ForegroundColor DarkGray
}

# Kill Backend (port 4000)
$backendResult = netstat -ano | Select-String ":4000.*LISTENING"
if ($backendResult) {
    foreach ($line in $backendResult) {
        $parts = $line -split '\s+'
        $processId = $parts[-1]
        if ($processId -match '^\d+$') {
            try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "[OK] Killed Backend process (PID: $processId, Port: 4000)" -ForegroundColor Green
                $killed = $true
            } catch {
                Write-Host "[WARN] Could not kill PID $processId : $_" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "[OK] Port 4000 is free" -ForegroundColor DarkGray
}

Write-Host ""
if ($killed) {
    Write-Host "Cleanup complete. You can now run: bun run dev" -ForegroundColor Green
} else {
    Write-Host "No leftover processes found. Ports are clean." -ForegroundColor Green
}
Write-Host ""
