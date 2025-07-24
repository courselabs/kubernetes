const vscode = require('vscode');

/**
 * Parser for Kubernetes Lab README files
 * Extracts code blocks for execution in terminals
 */
class LabParser {
    constructor() {
        this.codeBlocks = [];
    }

    /**
     * Parse README file and extract all code blocks
     */
    async parseLabReadme(readmePath) {
        try {
            const document = await vscode.workspace.openTextDocument(readmePath);
            const content = document.getText();
            
            this.codeBlocks = [];
            const lines = content.split('\n');
            
            let currentSection = 'Introduction';
            let inCodeBlock = false;
            let codeBlockLanguage = '';
            let currentBlockLines = [];
            let blockStartLine = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();
                
                // Track sections (## headers)
                if (trimmedLine.startsWith('## ')) {
                    currentSection = trimmedLine.replace('## ', '');
                    continue;
                }
                
                // Track subsections (### headers) 
                if (trimmedLine.startsWith('### ')) {
                    currentSection = trimmedLine.replace('### ', '');
                    continue;
                }
                
                // Handle code block start
                if (trimmedLine.startsWith('```')) {
                    if (!inCodeBlock) {
                        // Starting a code block
                        inCodeBlock = true;
                        codeBlockLanguage = trimmedLine.replace('```', '') || 'bash';
                        currentBlockLines = [];
                        blockStartLine = i + 1;
                    } else {
                        // Ending a code block
                        inCodeBlock = false;
                        
                        // Only add PowerShell code blocks for execution
                        if (currentBlockLines.length > 0 && this.isExecutableCodeBlock(codeBlockLanguage)) {
                            this.addCodeBlock(
                                currentSection,
                                currentBlockLines,
                                codeBlockLanguage,
                                blockStartLine,
                                i
                            );
                        }
                        
                        codeBlockLanguage = '';
                        currentBlockLines = [];
                    }
                    continue;
                }
                
                // Collect code block lines
                if (inCodeBlock) {
                    if (trimmedLine) {
                        // Check for special failure marker comments
                        if (trimmedLine.includes('# this_will_fail') || trimmedLine.includes('# this_could_fail')) {
                            currentBlockLines.push({ 
                                type: 'comment', 
                                content: line, 
                                shouldFail: true 
                            });
                        } else if (!trimmedLine.startsWith('#')) {
                            // Skip YAML examples that aren't meant to be executed
                            if (this.isExecutableCommand(trimmedLine, codeBlockLanguage)) {
                                currentBlockLines.push({ 
                                    type: 'command', 
                                    content: line 
                                });
                            }
                        }
                    }
                }
            }
            
            return this.codeBlocks;
            
        } catch (error) {
            throw new Error(`Failed to parse lab README: ${error.message}`);
        }
    }
    
    /**
     * Check if a code block should be executed (PowerShell and container blocks)
     */
    isExecutableCodeBlock(language) {
        // Execute PowerShell and container code blocks
        return language === 'powershell' || language === 'ps1' || language === 'container';
    }

    /**
     * Check if a line represents an executable command
     */
    isExecutableCommand(line, language) {
        const trimmed = line.trim();
        
        // Skip empty lines
        if (!trimmed) return false;
        
        // Skip comment lines
        if (trimmed.startsWith('#')) return false;
        
        // For container blocks, include everything as-is
        if (language === 'container') {
            return true; // Execute all lines in container blocks
        }
        
        // For PowerShell blocks, be more permissive since they're explicitly marked for execution
        if (language === 'powershell' || language === 'ps1') {
            // Skip YAML/JSON structure lines that might appear in PowerShell examples
            if (trimmed.match(/^(apiVersion|kind|metadata|spec|data):/)) return false;
            if (trimmed.match(/^(name|namespace|labels):/)) return false;
            if (trimmed.match(/^(containers|image|ports):/)) return false;
            if (trimmed.match(/^-\s*(name|image):/)) return false;
            
            // Include PowerShell cmdlets (Verb-Noun pattern)
            if (trimmed.match(/^[A-Z][a-z]+-[A-Z]/)) return true;
            
            // Include common PowerShell and cross-platform commands
            if (trimmed.startsWith('kubectl')) return true;
            if (trimmed.startsWith('k ')) return true; // kubectl alias
            if (trimmed.startsWith('helm')) return true;
            if (trimmed.startsWith('docker')) return true;
            if (trimmed.startsWith('curl')) return true;
            if (trimmed.startsWith('cd ')) return true;
            if (trimmed.startsWith('ls')) return true;
            if (trimmed.startsWith('cat')) return true;
            if (trimmed.startsWith('echo')) return true;
            if (trimmed.startsWith('Write-')) return true; // PowerShell Write commands
            if (trimmed.startsWith('Set-')) return true; // PowerShell Set commands
            if (trimmed.startsWith('Get-')) return true; // PowerShell Get commands
            if (trimmed.startsWith('New-')) return true; // PowerShell New commands
            if (trimmed.startsWith('Remove-')) return true; // PowerShell Remove commands
            if (trimmed.startsWith('Test-')) return true; // PowerShell Test commands
            if (trimmed.startsWith('Start-')) return true; // PowerShell Start commands
            if (trimmed.startsWith('Stop-')) return true; // PowerShell Stop commands
            
            // Include variable assignments and simple expressions
            if (trimmed.includes('=') && !trimmed.includes(':')) return true;
            
            // Include piped commands
            if (trimmed.includes('|')) return true;
            
            // Include anything that looks like a command (has spaces and doesn't look like YAML)
            if (trimmed.includes(' ') && !trimmed.includes(':')) return true;
            
            // Default to true for PowerShell blocks (since they're explicitly marked)
            return true;
        }
        
        // For non-PowerShell blocks, don't execute anything (they're reference only)
        return false;
    }

    /**
     * Add a code block to the collection
     */
    addCodeBlock(section, lines, language, startLine, endLine) {
        // Process structured lines (objects with type and content)
        const processedCommands = [];
        let shouldFailNext = false;
        
        for (let i = 0; i < lines.length; i++) {
            const lineObj = lines[i];
            
            if (lineObj.type === 'comment' && lineObj.shouldFail) {
                shouldFailNext = true;
            } else if (lineObj.type === 'command') {
                processedCommands.push({
                    command: lineObj.content,
                    shouldFail: shouldFailNext
                });
                shouldFailNext = false; // Reset after applying to command
            }
        }
        
        if (processedCommands.length === 0) {
            return; // Skip empty code blocks
        }
        
        // Extract just the command strings for compatibility
        const executableLines = processedCommands.map(cmd => cmd.command);
        
        // Determine if this is a kubectl command block
        const isKubectl = executableLines.some(line => 
            line.trim().startsWith('kubectl') || 
            line.trim().startsWith('k ')
        );
        
        // Determine execution type based on language
        let executionType = language;
        if (language === 'container') {
            executionType = 'container'; // Container shell commands
        } else if (isKubectl) {
            executionType = 'kubectl-powershell'; // Kubectl commands in PowerShell
        } else {
            executionType = 'powershell';
        }
        
        this.codeBlocks.push({
            id: this.codeBlocks.length + 1,
            section: section,
            language: language,
            executionType: executionType,
            lines: executableLines,
            commandsWithFlags: processedCommands, // Include failure flags
            rawLines: lines, // Keep original lines for reference
            startLine: startLine,
            endLine: endLine,
            isKubectl: isKubectl,
            description: `${section} - ${executableLines.length} command(s)`
        });
    }
    
    /**
     * Get code blocks grouped by section
     */
    getCodeBlocksBySection() {
        const sections = {};
        
        this.codeBlocks.forEach(block => {
            if (!sections[block.section]) {
                sections[block.section] = [];
            }
            sections[block.section].push(block);
        });
        
        return sections;
    }
    
    /**
     * Get all executable commands as flat list
     */
    getAllCommands() {
        const commands = [];
        
        this.codeBlocks.forEach(block => {
            block.lines.forEach((line, index) => {
                commands.push({
                    blockId: block.id,
                    section: block.section,
                    command: line.trim(),
                    executionType: block.executionType,
                    lineNumber: index + 1,
                    totalLines: block.lines.length
                });
            });
        });
        
        return commands;
    }
    
    /**
     * Find code block at specific line in document
     */
    findCodeBlockAtLine(lineNumber) {
        return this.codeBlocks.find(block => 
            lineNumber >= block.startLine && lineNumber <= block.endLine
        );
    }
    
    /**
     * Get summary of parsed content
     */
    getSummary() {
        const sections = this.getCodeBlocksBySection();
        const totalCommands = this.getAllCommands().length;
        const kubectlCommands = this.codeBlocks.filter(b => b.isKubectl).length;
        
        return {
            totalBlocks: this.codeBlocks.length,
            totalCommands: totalCommands,
            kubectlBlocks: kubectlCommands,
            sections: Object.keys(sections).length,
            sectionNames: Object.keys(sections)
        };
    }
}

module.exports = { LabParser };