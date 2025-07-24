# Install Lab Test Harness VS Code Extension
# PowerShell version

# Read version from package.json
$PackageJsonPath = Join-Path $PSScriptRoot "package.json"
$PackageJson = Get-Content $PackageJsonPath | ConvertFrom-Json
$Version = $PackageJson.version

Write-Host "🧪 Installing Kubernetes Lab Test Harness VS Code Extension v$Version" -ForegroundColor Green

# Determine VS Code extensions directory
$VSCodeExtensionsDir = ""
if ($IsWindows -or $env:OS -eq "Windows_NT") {
    $VSCodeExtensionsDir = "$env:USERPROFILE\.vscode\extensions"
} elseif ($IsMacOS) {
    $VSCodeExtensionsDir = "$env:HOME/.vscode/extensions"
} elseif ($IsLinux) {
    $VSCodeExtensionsDir = "$env:HOME/.vscode/extensions"
} else {
    # Fallback - try Windows first, then Unix-style
    if (Test-Path "$env:USERPROFILE\.vscode\extensions") {
        $VSCodeExtensionsDir = "$env:USERPROFILE\.vscode\extensions"
    } elseif (Test-Path "$env:HOME/.vscode/extensions") {
        $VSCodeExtensionsDir = "$env:HOME/.vscode/extensions"
    } else {
        Write-Host "❌ Could not determine VS Code extensions directory" -ForegroundColor Red
        Write-Host "   Please manually copy files to your VS Code extensions folder" -ForegroundColor Yellow
        exit 1
    }
}

# Create extensions directory if it doesn't exist
if (!(Test-Path $VSCodeExtensionsDir)) {
    New-Item -ItemType Directory -Path $VSCodeExtensionsDir -Force | Out-Null
}

# Extension target directory
$ExtensionDir = Join-Path $VSCodeExtensionsDir "lab-test-harness-$Version"

Write-Host "📁 Target directory: $ExtensionDir" -ForegroundColor Cyan

# Remove existing installation if it exists
if (Test-Path $ExtensionDir) {
    Write-Host "🗑️  Removing existing extension..." -ForegroundColor Yellow
    Remove-Item -Path $ExtensionDir -Recurse -Force
}

# Copy extension files
Write-Host "📦 Copying extension files..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $ExtensionDir -Force | Out-Null

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# List of files to copy
$FilesToCopy = @(
    "package.json",
    "extension.js", 
    "lab-parser.js",
    "terminal-executor.js",
    "README.md"
)

# Copy each file
foreach ($File in $FilesToCopy) {
    $SourcePath = Join-Path $ScriptDir $File
    $DestPath = Join-Path $ExtensionDir $File
    
    if (Test-Path $SourcePath) {
        Copy-Item -Path $SourcePath -Destination $DestPath -Force
        Write-Host "   ✅ Copied $File" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing source file: $File" -ForegroundColor Red
    }
}

Write-Host "✅ Extension files copied successfully" -ForegroundColor Green

# Check if VS Code is running and suggest restart
$VSCodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
if ($VSCodeProcesses) {
    Write-Host ""
    Write-Host "⚠️  VS Code is currently running" -ForegroundColor Yellow
    Write-Host "   Please reload the VS Code window to activate the extension:" -ForegroundColor Yellow
    Write-Host "   - Press Ctrl+Shift+P (Cmd+Shift+P on Mac)" -ForegroundColor White
    Write-Host "   - Type 'Developer: Reload Window'" -ForegroundColor White
    Write-Host "   - Press Enter" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "🚀 Installation complete! Lab Test Harness v$Version installed" -ForegroundColor Green
    Write-Host "   Start VS Code and the extension will be active" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📖 Usage:" -ForegroundColor Cyan
Write-Host "   1. Open a lab README.md file" -ForegroundColor White
Write-Host "   2. Right-click → 'Run Lab Test Harness'" -ForegroundColor White
Write-Host "   3. Or use Ctrl+Shift+Enter to run current code block" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Test with: labs/pods/README.md" -ForegroundColor Yellow

# Test if the extension directory was created successfully
if (Test-Path $ExtensionDir) {
    $FileCount = (Get-ChildItem $ExtensionDir).Count
    Write-Host ""
    Write-Host "✅ Installation verified: Lab Test Harness v$Version with $FileCount files installed" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Installation may have failed - extension directory not found" -ForegroundColor Red
    exit 1
}