const vscode = require('vscode');
const path = require('path');
const { LabParser } = require('./lab-parser');
const { TerminalExecutor } = require('./terminal-executor');

/**
 * Kubernetes Lab Test Harness Extension
 * Executes code blocks from lab README files
 */
class LabTestHarness {
    constructor() {
        this.parser = new LabParser();
        this.executor = new TerminalExecutor();
        this.isRunning = false;
        this.cancellationToken = null;
        this.shouldRunCleanup = false; // Default to not running cleanup
    }

    /**
     * Run the complete lab test harness
     */
    async runLab(readmePath = null) {
        try {
            this.isRunning = true;
            
            // Find and select lab README
            const labReadmePath = readmePath || await this.selectLabReadme();
            if (!labReadmePath) {
                return;
            }

            // Set up error tracking for this lab
            this.executor.setCurrentLabPath(labReadmePath.fsPath);

            // Setup window environment
            await this.setupDemoEnvironment(labReadmePath);

            // Parse the README
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            this.executor.log(`\n🧪 Starting Lab Test Harness`);
            this.executor.log(`📁 Workspace root: ${workspaceRoot}`);
            this.executor.log(`📖 Parsing README: ${labReadmePath.fsPath}`);
            
            const codeBlocks = await this.parser.parseLabReadme(labReadmePath);
            
            if (codeBlocks.length === 0) {
                vscode.window.showInformationMessage('No executable code blocks found in README');
                return;
            }

            // Show summary
            const summary = this.parser.getSummary();
            this.executor.log(`\n📊 Lab Summary:`);
            this.executor.log(`   Code blocks: ${summary.totalBlocks}`);
            this.executor.log(`   Total commands: ${summary.totalCommands}`);
            this.executor.log(`   Kubectl blocks: ${summary.kubectlBlocks}`);
            this.executor.log(`   Sections: ${summary.sections}`);
            
            this.executor.showOutput();

            // Create cancellation token for stopping execution
            this.cancellationToken = new vscode.CancellationTokenSource();

            // Filter out cleanup blocks based on selection during lab choice
            let blocksToExecute = codeBlocks;
            if (!this.shouldRunCleanup) {
                blocksToExecute = codeBlocks.filter(block => 
                    !block.section.toLowerCase().includes('cleanup')
                );
                
                const skippedCount = codeBlocks.length - blocksToExecute.length;
                if (skippedCount > 0) {
                    this.executor.log(`🚫 Skipping ${skippedCount} cleanup block(s) as requested`);
                }
            }
            
            this.executor.log(`\n🚀 Starting execution of ${blocksToExecute.length} code blocks...`);
            
            // Create a single terminal for the lab
            const labName = path.basename(path.dirname(labReadmePath.fsPath));
            const terminalName = `Lab: ${labName}`;
            const terminal = this.executor.getOrCreateTerminal(terminalName);
            terminal.show(); // Make sure terminal is visible
            
            // Give terminal time to initialize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Execute filtered blocks with cancellation support, using the same terminal
            await this.executeBlocks(blocksToExecute, { 
                type: 'all', 
                blocks: blocksToExecute,
                cancellationToken: this.cancellationToken.token,
                terminalName: terminalName
            });

        } catch (error) {
            this.executor.log(`❌ Lab execution failed: ${error.message}`);
            vscode.window.showErrorMessage(`Lab test harness failed: ${error.message}`);
        } finally {
            // Clean up
            if (this.cancellationToken) {
                this.cancellationToken.dispose();
                this.cancellationToken = null;
            }
            
            this.isRunning = false;
        }
    }

    /**
     * Run a specific code block (called from context menu or keybinding)
     */
    async runCodeBlock() {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const document = editor.document;
            if (!document.fileName.endsWith('README.md')) {
                vscode.window.showErrorMessage('Please run this command from a README.md file');
                return;
            }

            const currentLine = editor.selection.active.line + 1; // VS Code lines are 0-indexed
            
            // Parse current README
            const codeBlocks = await this.parser.parseLabReadme(document.uri);
            
            // Find code block at current cursor position
            const codeBlock = this.parser.findCodeBlockAtLine(currentLine);
            
            if (!codeBlock) {
                vscode.window.showInformationMessage('No code block found at current cursor position');
                return;
            }

            this.executor.log(`\n🎯 Running selected code block from line ${currentLine}`);
            await this.executor.executeCodeBlock(codeBlock);
            
            vscode.window.showInformationMessage(`Executed code block: ${codeBlock.description}`);

        } catch (error) {
            this.executor.log(`❌ Code block execution failed: ${error.message}`);
            vscode.window.showErrorMessage(`Failed to run code block: ${error.message}`);
        }
    }


    /**
     * Execute selected code blocks
     */
    async executeBlocks(blocks, runOption) {
        this.executor.log(`\n🚀 Executing ${blocks.length} code blocks`);
        
        const results = [];
        const cancellationToken = runOption.cancellationToken;
        const terminalName = runOption.terminalName || 'Lab Terminal';
        
        for (let i = 0; i < blocks.length; i++) {
            // Check for cancellation
            if (cancellationToken && cancellationToken.isCancellationRequested) {
                this.executor.log('🛑 Execution cancelled by user');
                break;
            }

            const block = blocks[i];
            this.executor.log(`\n--- Block ${i + 1}/${blocks.length}: ${block.section} ---`);
            
            const result = await this.executor.executeCodeBlock(block, {
                showProgress: false, // Don't show progress dialog, just execute
                cancellationToken: cancellationToken,
                terminalName: terminalName // Use the same terminal for all blocks
            });
            
            results.push(result);

            // Pause between blocks (with cancellation check)
            if (i < blocks.length - 1) {
                this.executor.log(`⏳ Waiting before next block...`);
                
                // Wait with cancellation support
                for (let wait = 0; wait < 5000; wait += 100) {
                    if (cancellationToken && cancellationToken.isCancellationRequested) {
                        this.executor.log('🛑 Execution cancelled during wait');
                        return;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }

        // Show summary
        const successfulBlocks = results.filter(r => r.successRate === 1).length;
        const totalCommands = results.reduce((sum, r) => sum + r.results.length, 0);
        const successfulCommands = results.reduce((sum, r) => sum + r.results.filter(cmd => cmd.success).length, 0);

        this.executor.log(`\n✅ Execution Complete!`);
        this.executor.log(`   Blocks: ${successfulBlocks}/${results.length} successful`);
        this.executor.log(`   Commands: ${successfulCommands}/${totalCommands} successful`);

        vscode.window.showInformationMessage(
            `Lab execution complete: ${successfulBlocks}/${results.length} blocks successful`
        );
    }


    /**
     * Find and let user select lab README.md file
     */
    async selectLabReadme() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return null;
        }

        // Find all lab README files
        const availableLabs = await this.findAvailableLabs();
        
        if (availableLabs.length === 0) {
            vscode.window.showErrorMessage('No lab README files found in labs/ directory');
            return null;
        }

        // Build options list 
        const options = ['Auto-detect from current location'];
        
        // Add found labs
        for (const lab of availableLabs) {
            options.push(lab.label);
        }
        
        // Add custom path option
        options.push('Custom path...');
        
        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select lab to test'
        });
        
        if (!selection) return null;
        
        let selectedReadmePath = null;
        
        // Handle auto-detection
        if (selection === 'Auto-detect from current location') {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor && activeEditor.document.fileName.endsWith('README.md')) {
                const filePath = activeEditor.document.fileName;
                if (filePath.includes('/labs/')) {
                    selectedReadmePath = activeEditor.document.uri;
                }
            }
            
            // If no suitable active editor, default to first available lab
            if (!selectedReadmePath && availableLabs.length > 0) {
                selectedReadmePath = availableLabs[0].uri;
            }
            
            if (!selectedReadmePath) {
                vscode.window.showErrorMessage('Could not auto-detect lab from current location');
                return null;
            }
        }
        // Handle custom path
        else if (selection === 'Custom path...') {
            const customPath = await vscode.window.showInputBox({
                prompt: 'Enter lab path (e.g., labs/pods)',
                placeHolder: 'labs/pods'
            });
            
            if (!customPath) return null;
            
            const readmePath = vscode.Uri.joinPath(workspaceFolder.uri, customPath, 'README.md');
            
            // Verify the file exists
            try {
                await vscode.workspace.openTextDocument(readmePath);
                selectedReadmePath = readmePath;
            } catch (error) {
                vscode.window.showErrorMessage(`README not found at ${readmePath.fsPath}`);
                return null;
            }
        }
        // Handle specific lab selection
        else {
            const selectedLab = availableLabs.find(lab => lab.label === selection);
            if (selectedLab) {
                selectedReadmePath = selectedLab.uri;
            }
        }
        
        if (!selectedReadmePath) {
            return null;
        }
        
        // Now ask about cleanup
        const cleanupChoice = await vscode.window.showQuickPick([
            {
                label: '🚫 Skip Cleanup',
                description: 'Leave lab resources running (recommended for learning)',
                value: false
            },
            {
                label: '🧹 Run Cleanup',
                description: 'Delete all lab resources at the end',
                value: true
            }
        ], {
            placeHolder: 'Run cleanup commands at the end of the lab?'
        });
        
        if (cleanupChoice === undefined) return null; // User cancelled
        
        this.shouldRunCleanup = cleanupChoice.value;
        return selectedReadmePath;
    }

    /**
     * Find all available lab README files
     */
    async findAvailableLabs() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }

        // Search for pattern labs/*/README.md
        const pattern = new vscode.RelativePattern(workspaceFolder, 'labs/*/README.md');
        const readmeFiles = await vscode.workspace.findFiles(pattern);
        
        const labs = [];
        for (const file of readmeFiles) {
            const relativePath = path.relative(workspaceFolder.uri.fsPath, file.fsPath);
            const match = relativePath.match(/^labs\/([^\/]+)\/README\.md$/);
            if (match) {
                const labName = match[1];
                // Try to read the first header from README for description
                let description = labName;
                try {
                    const doc = await vscode.workspace.openTextDocument(file);
                    const firstLine = doc.lineAt(0).text;
                    if (firstLine.startsWith('#')) {
                        description = firstLine.replace(/^#+\s*/, '').trim();
                    }
                } catch (error) {
                    // Use lab name as fallback description
                }
                labs.push({
                    name: labName,
                    description: description,
                    label: `${labName.toUpperCase()} - ${description}`,
                    uri: file,
                    relativePath: relativePath
                });
            }
        }
        
        // Sort labs alphabetically by name
        labs.sort((a, b) => a.name.localeCompare(b.name));
        return labs;
    }

    /**
     * Setup demo environment - close windows and open README in preview
     */
    async setupDemoEnvironment(readmePath) {
        try {
            this.executor.log('🖥️  Setting up demo environment...');
            
            // Close all editor tabs
            await vscode.commands.executeCommand('workbench.action.closeAllEditors');
            
            // Wait a moment for editors to close
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Open README in preview mode
            const document = await vscode.workspace.openTextDocument(readmePath);
            await vscode.window.showTextDocument(document, {
                preview: true,
                viewColumn: vscode.ViewColumn.One
            });
            
            // Switch to preview mode
            await vscode.commands.executeCommand('markdown.showPreview');
            
            this.executor.log('✅ Demo environment ready');
            
        } catch (error) {
            this.executor.log(`⚠️  Could not setup demo environment: ${error.message}`);
            // Continue anyway - this is not critical
        }
    }

    /**
     * Stop current execution
     */
    async stopExecution() {
        if (this.isRunning) {
            this.executor.log('🛑 Stopping lab execution...');
            
            // Cancel any ongoing operations
            if (this.cancellationToken) {
                this.cancellationToken.cancel();
            }
            
            this.executor.killAllTerminals();
            this.isRunning = false;
            vscode.window.showInformationMessage('Lab execution stopped');
        } else {
            vscode.window.showInformationMessage('No lab execution is currently running');
        }
    }

    /**
     * Dispose resources
     */
    dispose() {
        this.executor.dispose();
    }
}

/**
 * Extension activation
 */
function activate(context) {
    console.log('Lab Test Harness extension is now active!');
    
    const labHarness = new LabTestHarness();
    
    // Register run lab command
    const runLabDisposable = vscode.commands.registerCommand('lab-test-harness.runLab', async (resourceUri) => {
        try {
            const readmePath = resourceUri || null;
            await labHarness.runLab(readmePath);
        } catch (error) {
            vscode.window.showErrorMessage(`Lab test harness failed: ${error.message}`);
        }
    });
    
    // Register run code block command
    const runCodeBlockDisposable = vscode.commands.registerCommand('lab-test-harness.runCodeBlock', async () => {
        try {
            await labHarness.runCodeBlock();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to run code block: ${error.message}`);
        }
    });

    // Register stop execution command
    const stopExecutionDisposable = vscode.commands.registerCommand('lab-test-harness.stopExecution', async () => {
        try {
            await labHarness.stopExecution();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to stop execution: ${error.message}`);
        }
    });
    
    context.subscriptions.push(runLabDisposable, runCodeBlockDisposable, stopExecutionDisposable);
    
    // Cleanup on deactivation
    context.subscriptions.push({
        dispose: () => labHarness.dispose()
    });
}

/**
 * Extension deactivation
 */
function deactivate() {
    console.log('Lab Test Harness extension deactivated');
}

module.exports = {
    activate,
    deactivate
};