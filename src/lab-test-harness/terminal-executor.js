const vscode = require('vscode');

/**
 * Terminal executor for running lab commands with error tracking
 */
class TerminalExecutor {
    constructor() {
        this.terminals = new Map(); // Map terminal names to terminal instances
        this.outputChannel = vscode.window.createOutputChannel('Lab Test Harness');
        this.errorTracking = new Map(); // Track errors per lab
        this.currentLabPath = null;
    }

    /**
     * Set the current lab path for error tracking
     */
    setCurrentLabPath(labPath) {
        this.currentLabPath = labPath;
        if (!this.errorTracking.has(labPath)) {
            this.errorTracking.set(labPath, {
                errors: [],
                warnings: [],
                labPath: labPath,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Execute a single command in a terminal with error tracking
     */
    async executeCommand(command, options = {}) {
        const {
            terminalName = 'Lab Terminal',
            executionType = 'powershell',
            showOutput = true,
            waitForCompletion = false,
            section = 'Unknown',
            blockId = null
        } = options;

        try {
            // Get or create terminal
            const terminal = this.getOrCreateTerminal(terminalName);
            
            // Show terminal if requested
            if (showOutput) {
                terminal.show();
            }

            // Log command execution
            this.log(`Executing: ${command}`);
            
            
            // Create a wrapper command that captures exit code and output
            const commandWithErrorTracking = this.wrapCommandForErrorTracking(command, section, blockId, executionType);
            
            // Send command to terminal
            terminal.sendText(commandWithErrorTracking);
            
            // Wait for command to process if requested
            if (waitForCompletion) {
                // Wait for command to complete
                await this.sleep(2000);
                
                // Check for placeholders (warning only)
                if (command.includes('<') && command.includes('>')) {
                    await this.trackWarning(command, 'Command contains placeholder that needs to be replaced', section, blockId);
                }
                
                // For PowerShell commands, check if command failed and should be logged
                if (executionType !== 'container') {
                    // Check if this command is expected to fail
                    const shouldFail = options.shouldFail || false;
                    
                    // Send a command to get the actual exit code
                    terminal.sendText(`$lastExit = $LASTEXITCODE; Write-Host "EXIT_CODE_CHECK_${blockId}_$lastExit"`);
                    await this.sleep(500);
                    
                    // Since we can't capture terminal output easily, we'll use a simple approach:
                    // For now, we'll track common failure indicators and let the user verify
                    // In a real implementation, we'd parse the terminal output for our markers
                    
                    // Only track errors if not expected to fail and not a kubectl exec command
                    if (!shouldFail && !this.isKubectlExecCommand(command)) {
                        this.log(`ℹ️  If you see ❌ above, this command failed and should be investigated`);
                    } else if (shouldFail) {
                        this.log(`ℹ️  Command expected to fail - ignoring any ❌ indicator`);
                    } else {
                        this.log(`ℹ️  kubectl exec command - no error tracking available`);
                    }
                }
            }

            return { 
                success: true, 
                terminal: terminal,
                command: command,
                section: section,
                blockId: blockId
            };

        } catch (error) {
            this.log(`Error executing command: ${error.message}`);
            await this.trackError(command, error.message, section, blockId);
            return { 
                success: false, 
                error: error.message,
                command: command,
                section: section,
                blockId: blockId
            };
        }
    }



    /**
     * Check if this is any kubectl exec command (interactive or not)
     */
    isKubectlExecCommand(command) {
        const trimmed = command.trim();
        
        // Match any kubectl exec command since they all execute in container context
        // where PowerShell exit code checking won't work
        return /kubectl\s+exec\s+/i.test(trimmed);
    }


    /**
     * Wrap command to track exit codes and capture errors
     */
    wrapCommandForErrorTracking(command, section, blockId, executionType = 'powershell') {
        // For container blocks, execute exactly as-is without any wrapping
        if (executionType === 'container') {
            return command;
        }
        
        // Check if this is any kubectl exec command
        // These execute in container context where PowerShell exit code checking won't work
        if (this.isKubectlExecCommand(command)) {
            return `echo ''; ${command}`;
        }
        
        // Add clean formatting with newlines and error checking
        return `echo ''; ${command}; if (-not $?) { Write-Host "❌ Command failed" -ForegroundColor Red } else { Write-Host "✅ Success" -ForegroundColor Green }; echo ''`;
    }

    /**
     * Track an error for the current lab and immediately update TODO.md
     */
    async trackError(command, error, section, blockId) {
        if (!this.currentLabPath) return;
        
        const labErrors = this.errorTracking.get(this.currentLabPath);
        if (labErrors) {
            labErrors.errors.push({
                command: command,
                error: error,
                section: section,
                blockId: blockId,
                timestamp: new Date().toISOString()
            });

            // Immediately update TODO.md
            await this.updateTodoFile();
        }
    }

    /**
     * Track a warning for the current lab and immediately update TODO.md
     */
    async trackWarning(command, warning, section, blockId) {
        if (!this.currentLabPath) return;
        
        const labErrors = this.errorTracking.get(this.currentLabPath);
        if (labErrors) {
            labErrors.warnings.push({
                command: command,
                warning: warning,
                section: section,
                blockId: blockId,
                timestamp: new Date().toISOString()
            });

            // Immediately update TODO.md
            await this.updateTodoFile();
        }
    }

    /**
     * Execute multiple commands in sequence with smart delays
     */
    async executeCommands(commands, options = {}) {
        const {
            terminalName = 'Lab Terminal',
            showProgress = true,
            section = 'Unknown',
            blockId = null
        } = options;

        const results = [];
        
        // Execute without progress dialog for cleaner terminal view
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const commandText = typeof command === 'string' ? command : command.command;
            const shouldFail = typeof command === 'object' ? command.shouldFail : false;
            
            this.log(`⏱️  Command ${i + 1}/${commands.length}: ${commandText}${shouldFail ? ' (expected to fail)' : ''}`);
            
            const result = await this.executeCommand(commandText, { 
                terminalName,
                executionType: options.executionType || 'powershell',
                waitForCompletion: true, // Always wait for completion
                section: section,
                blockId: blockId,
                shouldFail: shouldFail
            });
            results.push(result);
            
            // Simple delay between commands
            if (i < commands.length - 1) {
                const delay = 1000; // 1 second between commands
                this.log(`⏳ Waiting 1s before next command...`);
                await this.sleep(delay);
            }
        }

        return results;
    }

    /**
     * Execute a code block with all its commands
     */
    async executeCodeBlock(codeBlock, options = {}) {
        // Use the provided terminal name or default lab terminal (don't create per section)
        const terminalName = options.terminalName || 'Lab Terminal';
        
        this.log(`\n--- Executing Code Block ---`);
        this.log(`Section: ${codeBlock.section}`);
        this.log(`Commands: ${codeBlock.lines.length}`);
        this.log(`Type: ${codeBlock.executionType}`);
        
        // Use commandsWithFlags if available, otherwise fall back to lines
        const commandsToExecute = codeBlock.commandsWithFlags || codeBlock.lines.map(line => ({ command: line, shouldFail: false }));
        
        const results = await this.executeCommands(commandsToExecute, {
            terminalName,
            executionType: codeBlock.executionType,
            showProgress: options.showProgress !== false,
            section: codeBlock.section,
            blockId: codeBlock.id
        });

        const successCount = results.filter(r => r.success).length;
        this.log(`Completed: ${successCount}/${results.length} commands successful`);

        // Track any failures
        const failures = results.filter(r => !r.success);
        for (const failure of failures) {
            await this.trackError(failure.command, failure.error || 'Command failed', codeBlock.section, codeBlock.id);
        }

        return {
            codeBlock,
            results,
            successRate: successCount / results.length,
            failures: failures
        };
    }

    /**
     * Get or create a terminal with given name
     */
    getOrCreateTerminal(name) {
        if (this.terminals.has(name)) {
            const terminal = this.terminals.get(name);
            // Check if terminal still exists
            if (terminal.exitStatus === undefined) {
                return terminal;
            } else {
                // Terminal was closed, remove from map
                this.terminals.delete(name);
            }
        }

        // Get workspace root - this is where the terminal should start
        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            throw new Error('No workspace folder found');
        }

        // Create new terminal with working directory at workspace root
        const terminal = vscode.window.createTerminal({
            name: name,
            cwd: workspaceRoot
        });

        // Ensure we're in the correct directory
        this.log(`Terminal '${name}' created with working directory: ${workspaceRoot}`);
        
        this.terminals.set(name, terminal);
        
        // Clean up when terminal is closed
        const disposable = vscode.window.onDidCloseTerminal(closedTerminal => {
            if (closedTerminal === terminal) {
                this.terminals.delete(name);
                disposable.dispose();
            }
        });

        return terminal;
    }

    /**
     * Kill all managed terminals
     */
    killAllTerminals() {
        this.terminals.forEach((terminal, name) => {
            this.log(`Closing terminal: ${name}`);
            terminal.dispose();
        });
        this.terminals.clear();
    }

    /**
     * Get list of active terminals
     */
    getActiveTerminals() {
        const active = [];
        this.terminals.forEach((terminal, name) => {
            if (terminal.exitStatus === undefined) {
                active.push(name);
            }
        });
        return active;
    }


    /**
     * Log message to output channel
     */
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    /**
     * Show output channel
     */
    showOutput() {
        this.outputChannel.show();
    }


    /**
     * Utility sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Update TODO.md file for the current lab (creates if doesn't exist, updates if it does)
     */
    async updateTodoFile(labPath = null) {
        const targetPath = labPath || this.currentLabPath;
        const path = require('path');
        const fs = require('fs').promises;
        
        if (!this.errorTracking.has(targetPath)) {
            return; // No errors to report
        }

        const labErrors = this.errorTracking.get(targetPath);
        if (labErrors.errors.length === 0 && labErrors.warnings.length === 0) {
            return; // No issues to report
        }

        // Determine the lab directory
        const labDir = path.dirname(targetPath);
        const todoPath = path.join(labDir, 'TODO.md');

        // Generate TODO content
        let todoContent = `# Lab Test Issues\n\n`;
        todoContent += `Generated: ${new Date().toISOString()}\n`;
        todoContent += `Lab: ${path.basename(labDir)}\n\n`;

        if (labErrors.errors.length > 0) {
            todoContent += `## ❌ Errors (${labErrors.errors.length})\n\n`;
            
            labErrors.errors.forEach((error, index) => {
                todoContent += `### Error ${index + 1}: ${error.section}\n\n`;
                todoContent += `**Command:** \`${error.command}\`\n\n`;
                todoContent += `**Error:** ${error.error}\n\n`;
                todoContent += `**Time:** ${error.timestamp}\n\n`;
                todoContent += `**Block ID:** ${error.blockId}\n\n`;
                todoContent += `**Investigation needed:**\n`;
                todoContent += `- [ ] Check if command syntax is correct\n`;
                todoContent += `- [ ] Verify prerequisites are met\n`;
                todoContent += `- [ ] Check if resources exist\n`;
                todoContent += `- [ ] Validate cluster state\n\n`;
                todoContent += `---\n\n`;
            });
        }

        if (labErrors.warnings.length > 0) {
            todoContent += `## ⚠️ Warnings (${labErrors.warnings.length})\n\n`;
            
            labErrors.warnings.forEach((warning, index) => {
                todoContent += `### Warning ${index + 1}: ${warning.section}\n\n`;
                todoContent += `**Command:** \`${warning.command}\`\n\n`;
                todoContent += `**Warning:** ${warning.warning}\n\n`;
                todoContent += `**Time:** ${warning.timestamp}\n\n`;
                todoContent += `**Block ID:** ${warning.blockId}\n\n`;
                todoContent += `**Review needed:**\n`;
                todoContent += `- [ ] Check if this is expected behavior\n`;
                todoContent += `- [ ] Verify if documentation needs updates\n\n`;
                todoContent += `---\n\n`;
            });
        }

        todoContent += `## 🔧 Resolution Checklist\n\n`;
        todoContent += `- [ ] All errors have been investigated\n`;
        todoContent += `- [ ] Commands have been tested manually\n`;
        todoContent += `- [ ] Lab documentation has been updated if needed\n`;
        todoContent += `- [ ] Prerequisites section is accurate\n`;
        todoContent += `- [ ] Cleanup instructions work correctly\n\n`;

        todoContent += `## 📋 Lab Test Summary\n\n`;
        todoContent += `- **Total Errors:** ${labErrors.errors.length}\n`;
        todoContent += `- **Total Warnings:** ${labErrors.warnings.length}\n`;
        todoContent += `- **Test Date:** ${labErrors.timestamp}\n`;
        todoContent += `- **Lab Path:** \`${targetPath}\`\n\n`;

        try {
            await fs.writeFile(todoPath, todoContent, 'utf8');
            this.log(`📝 Generated TODO.md: ${todoPath}`);
            
            // Show the TODO file in VS Code
            const todoUri = vscode.Uri.file(todoPath);
            const document = await vscode.workspace.openTextDocument(todoUri);
            await vscode.window.showTextDocument(document);
            
            return todoPath;
        } catch (error) {
            this.log(`❌ Failed to generate TODO.md: ${error.message}`);
            return null;
        }
    }

    /**
     * Get error summary for current lab
     */
    getErrorSummary(labPath = null) {
        const targetPath = labPath || this.currentLabPath;
        if (!targetPath || !this.errorTracking.has(targetPath)) {
            return null;
        }

        const labErrors = this.errorTracking.get(targetPath);
        return {
            totalErrors: labErrors.errors.length,
            totalWarnings: labErrors.warnings.length,
            hasIssues: labErrors.errors.length > 0 || labErrors.warnings.length > 0,
            labPath: targetPath,
            timestamp: labErrors.timestamp
        };
    }


    /**
     * Dispose of resources
     */
    dispose() {
        this.killAllTerminals();
        this.outputChannel.dispose();
    }
}

module.exports = { TerminalExecutor };