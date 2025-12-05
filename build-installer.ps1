# ANYON Windows Installer Build Script
# This script builds a Windows installer with bundled Git and Node.js

param(
    [switch]$SkipDependencyCheck,
    [switch]$SkipBuild,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

Write-Info "=== ANYON Installer Build Script ==="
Write-Info "Building installer with bundled Git and Node.js"
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to get file size in MB
function Get-FileSizeMB {
    param($Path)
    if (Test-Path $Path) {
        return [math]::Round((Get-Item $Path).Length / 1MB, 2)
    }
    return 0
}

# Step 1: Check build tools
Write-Info "Step 1: Checking build tools..."

if (-not (Test-Command "npm")) {
    Write-Error "ERROR: npm not found! Please install Node.js"
    exit 1
}
Write-Success "✓ npm found"

if (-not (Test-Command "cargo")) {
    Write-Error "ERROR: cargo not found! Please install Rust"
    exit 1
}
Write-Success "✓ cargo found"

# Step 2: Check portable dependencies
if (-not $SkipDependencyCheck) {
    Write-Info "`nStep 2: Checking portable dependencies..."

    $gitPath = "src-tauri\resources\git-portable\cmd\git.exe"
    $nodePath = "src-tauri\resources\node-portable\node.exe"
    $npxPath = "src-tauri\resources\node-portable\npx.cmd"

    $gitExists = Test-Path $gitPath
    $nodeExists = Test-Path $nodePath
    $npxExists = Test-Path $npxPath

    if (-not $gitExists) {
        Write-Error "ERROR: Git Portable not found at: $gitPath"
        Write-Warning "Please download from: https://github.com/git-for-windows/git/releases/latest"
        Write-Warning "Extract to: src-tauri\resources\git-portable\"
        Write-Host ""
        Write-Host "Quick setup:"
        Write-Host "  1. Download PortableGit-*-64-bit.7z.exe"
        Write-Host "  2. Run: .\PortableGit-*.exe -o`"src-tauri\resources\git-portable`" -y"
        exit 1
    }
    Write-Success "✓ Git Portable found ($([math]::Round((Get-Item $gitPath).Length / 1KB, 0)) KB)"

    if (-not $nodeExists) {
        Write-Error "ERROR: Node.js Portable not found at: $nodePath"
        Write-Warning "Please download from: https://nodejs.org/dist/latest/"
        Write-Warning "Extract to: src-tauri\resources\node-portable\"
        Write-Host ""
        Write-Host "Quick setup:"
        Write-Host "  1. Download node-v*-win-x64.zip"
        Write-Host "  2. Extract and rename to: src-tauri\resources\node-portable\"
        exit 1
    }
    Write-Success "✓ Node.js Portable found ($([math]::Round((Get-Item $nodePath).Length / 1KB, 0)) KB)"

    if (-not $npxExists) {
        Write-Error "ERROR: npx.cmd not found at: $npxPath"
        Write-Warning "Make sure Node.js Portable is properly extracted"
        exit 1
    }
    Write-Success "✓ NPX found"

    # Calculate total bundle size
    $gitSize = Get-FileSizeMB "src-tauri\resources\git-portable"
    $nodeSize = Get-FileSizeMB "src-tauri\resources\node-portable"
    Write-Info "Total portable dependencies size: ~$([math]::Round($gitSize + $nodeSize, 0)) MB"
}
else {
    Write-Warning "Skipping dependency check (--SkipDependencyCheck)"
}

# Step 3: Build frontend
if (-not $SkipBuild) {
    Write-Info "`nStep 3: Building frontend..."

    try {
        if ($Verbose) {
            npm run build
        }
        else {
            npm run build 2>&1 | Out-Null
        }
        Write-Success "✓ Frontend build completed"
    }
    catch {
        Write-Error "ERROR: Frontend build failed!"
        Write-Error $_.Exception.Message
        exit 1
    }
}
else {
    Write-Warning "Skipping frontend build (--SkipBuild)"
}

# Step 4: Build Tauri app with NSIS bundler
Write-Info "`nStep 4: Building Tauri app with NSIS bundler..."

try {
    Push-Location src-tauri

    Write-Info "Running: cargo tauri build --bundles nsis"

    if ($Verbose) {
        cargo tauri build --bundles nsis
    }
    else {
        cargo tauri build --bundles nsis 2>&1 | Out-Null
    }

    Pop-Location
    Write-Success "✓ Tauri build completed"
}
catch {
    Pop-Location
    Write-Error "ERROR: Tauri build failed!"
    Write-Error $_.Exception.Message
    exit 1
}

# Step 5: Verify output
Write-Info "`nStep 5: Verifying build output..."

$installerPattern = "src-tauri\target\release\bundle\nsis\ANYON_*_x64-setup.exe"
$installers = Get-ChildItem $installerPattern -ErrorAction SilentlyContinue

if ($installers) {
    Write-Success "✓ Installer(s) created:"
    foreach ($installer in $installers) {
        $size = Get-FileSizeMB $installer.FullName
        Write-Host "  - $($installer.Name) ($size MB)" -ForegroundColor Cyan
        Write-Host "    Path: $($installer.FullName)" -ForegroundColor Gray
    }
}
else {
    Write-Warning "WARNING: No installer found at: $installerPattern"
    Write-Warning "Check build output for errors"
}

# Summary
Write-Host ""
Write-Info "=== Build Summary ==="
Write-Success "Build process completed successfully!"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Test the installer on a clean Windows machine"
Write-Host "  2. Verify Git and Node.js work correctly"
Write-Host "  3. Check application logs in: %APPDATA%\com.anyon.app\logs"
Write-Host ""
Write-Info "To test locally:"
if ($installers) {
    Write-Host "  $($installers[0].FullName)" -ForegroundColor Yellow
}

Write-Host ""
Write-Success "Done!"
