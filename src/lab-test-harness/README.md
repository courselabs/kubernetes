# Kubernetes Lab Test Harness

A VS Code extension that parses Kubernetes lab README files and executes code blocks in terminal windows.

## Features

- **Parse Lab READMEs**: Automatically extracts executable code blocks from Kubernetes lab README files
- **Flexible Execution**: Run all code blocks, specific sections, or individual blocks
- **Terminal Integration**: Executes commands in VS Code integrated terminals with clear command formatting
- **Smart Execution**: Adaptive delays (1s success, 5s errors), automatic retry on failures, enhanced command visibility
- **Progress Tracking**: Shows execution progress with detailed logging
- **Context Awareness**: Works from current README or lets you select lab directories

## Usage

### Run Complete Lab
1. Use Command Palette: `Lab: Run Lab Test Harness` or right-click README.md files
2. **Select a lab** from the list of available labs:
   - Auto-detect from current location
   - Choose from discovered labs (e.g., "PODS - Running Containers in Pods")
   - Enter custom path
3. **Window setup**: All editor windows close, README opens in preview mode
4. **Smart execution**: Commands run with adaptive delays (1s for success, 5s for errors) and automatic retry on failures
5. **Stop anytime**: Use `Ctrl+Shift+Escape` or Command Palette → "Lab: Stop Lab Execution"
6. **Error tracking**: Failed commands are automatically tracked and written to TODO.md

### Run Single Code Block
1. Place cursor inside a code block in README.md
2. Press `Ctrl+Shift+Enter` (or `Cmd+Shift+Enter` on Mac)
3. Or use Command Palette: `Lab: Run Selected Code Block`

## Code Block Detection

The parser identifies these types of code blocks:

```bash
# Basic shell commands
kubectl get pods
kubectl apply -f specs/
```

```powershell  
# PowerShell commands (Windows)
Get-Process
kubectl get nodes
```

```container
# Container shell commands (executed as-is, no PowerShell error handling)
hostname
printenv
nslookup kubernetes
```

## Features in Detail

### Smart Parsing
- Extracts code blocks from markdown
- Ignores comments and empty lines
- Groups commands by README sections
- Identifies kubectl vs general commands

### Execution Options
- **All Blocks**: Run every code block in sequence
- **By Section**: Choose which README sections to execute
- **Individual Blocks**: Pick specific code blocks
- **Preview Mode**: See what would be executed without running

### Terminal Management
- Creates named terminals per section
- **Working directory set to repository root** (for relative paths in labs)
- Reuses existing terminals when possible
- Provides execution logging in output channel
- Configurable delays between commands

### Execution Settings
- **Speed Control**: 200ms to 2000ms delays between commands
- **Flow Control**: Run continuously or pause between blocks
- **Progress Display**: Visual progress indicators
- **Cancellation**: Stop execution at any time

## Installation

### Quick Install (Recommended)

**PowerShell (Windows/macOS/Linux):**
```powershell
cd src/lab-test-harness
./install-extension.ps1
```
*Shows version number during installation for easy tracking*

### Manual Installation
1. Copy the `src/lab-test-harness` directory to your VS Code extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\lab-test-harness-1.1.0`
   - **macOS**: `~/.vscode/extensions/lab-test-harness-1.1.0`  
   - **Linux**: `~/.vscode/extensions/lab-test-harness-1.1.0`

2. Reload VS Code
3. The extension should be active automatically

### Package as VSIX (Advanced)
```bash
npm install -g vsce
cd src/lab-test-harness
vsce package
code --install-extension lab-test-harness-1.0.0.vsix
```

## Commands

| Command | Keybinding | Description |
|---------|------------|-------------|
| `Lab: Run Lab Test Harness` | - | Run complete lab or selected parts |
| `Lab: Run Selected Code Block` | `Ctrl+Shift+Enter` | Execute code block at cursor |
| `Lab: Stop Lab Execution` | `Ctrl+Shift+Escape` | Stop currently running lab execution |

## Context Menus

- Right-click on `README.md` files in Explorer → `Run Lab Test Harness`

## Supported Lab Structure

The extension expects Kubernetes labs with this structure:

```
labs/
├── pods/
│   ├── README.md          # Main lab instructions
│   ├── specs/             # YAML manifests
│   └── solution/          # Solution files
├── services/
│   ├── README.md
│   ├── specs/
│   └── solution/
...
```

### README Format
- Uses standard markdown with code blocks
- Sections defined by `##` and `###` headers
- Commands in fenced code blocks (` ``` `)
- Supports bash, powershell, and container code blocks

## Output and Logging

- **Output Channel**: `Lab Test Harness` shows execution logs
- **Terminal Windows**: Named terminals per section show command output
- **Progress Notifications**: VS Code notifications show execution progress
- **Error Handling**: Failed commands logged with error details

## Tips

1. **Start Simple**: Try preview mode first to see what would be executed
2. **Section-by-Section**: Run individual sections to test incrementally  
3. **Check Prerequisites**: Ensure kubectl is configured and cluster is accessible
4. **Monitor Progress**: Keep output channel open to track execution
5. **Clean Up**: Labs often include cleanup commands at the end

## Troubleshooting

### Extension Not Loading
- Check VS Code developer tools console for errors
- Ensure all files are in the correct directory structure
- Try reloading VS Code window

### Commands Not Executing  
- Verify terminal is accessible and responding
- Check if kubectl context is set correctly
- Look at output channel for error messages

### Parser Issues
- Ensure README uses standard markdown code blocks
- Check that code blocks use supported languages (bash, powershell, container)
- Verify indentation and syntax in README

## Development

### Structure
- `extension.js` - Main extension logic and command registration
- `lab-parser.js` - README parsing and code block extraction  
- `terminal-executor.js` - Terminal management and command execution
- `package.json` - Extension manifest and configuration

### Testing
Run with a sample lab README to test functionality:

```bash  
cd labs/pods
# Open README.md in VS Code
# Use Command Palette: "Lab: Run Lab Test Harness"
```

## Future Enhancements

- [ ] Support for multi-line commands with line continuations
- [ ] Integration with lab cleanup automation
- [ ] Execution result validation (success/failure detection)
- [ ] Support for environment variables and substitutions
- [ ] Integration with VS Code testing framework
- [ ] Export execution results to files
- [ ] Remote cluster execution support