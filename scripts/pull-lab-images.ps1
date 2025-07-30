#!/usr/bin/env pwsh
<#
.SYNOPSIS
Pull Docker images for specified Kubernetes labs

.DESCRIPTION
This script reads the lab-images.json file and pulls all Docker images required for the specified labs.
You can pull images for specific labs, all labs, or all labs in a specific section.

.PARAMETER Labs
Array of lab names to pull images for. Cannot be used with -All or -Section.

.PARAMETER All
Pull images for all labs. Cannot be used with -Labs or -Section.

.PARAMETER Section
Name of the section to pull images for. Cannot be used with -Labs or -All.

.EXAMPLE
./pull-lab-images.ps1 -Labs pods,services
Pull images for the pods and services labs

.EXAMPLE
./pull-lab-images.ps1 -All
Pull images for all labs

.EXAMPLE
./pull-lab-images.ps1 -Labs deployments
Pull images for just the deployments lab

.EXAMPLE
./pull-lab-images.ps1 -Section "Advanced Application Modelling"
Pull images for all labs in the Advanced Application Modelling section
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false, ParameterSetName='Specific')]
    [string[]]$Labs,
    
    [Parameter(Mandatory=$false, ParameterSetName='All')]
    [switch]$All,
    
    [Parameter(Mandatory=$false, ParameterSetName='Section')]
    [ValidateSet(
        'Core Kubernetes',
        'Application Modelling',
        'Advanced Application Modelling',
        'Operating Kubernetes',
        'Continuous Integration and Continuous Deployment (CI/CD)',
        'Advanced Kubernetes',
        'Production Operations',
        'Real Kubernetes',
        'Additional Labs'
    )]
    [string]$Section
)

# Check that at least one parameter is provided
if (-not $Labs -and -not $All -and -not $Section) {
    Write-Error "You must specify either -Labs, -All, or -Section parameter"
    exit 1
}

# Set the path to the JSON file
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path -Path (Split-Path -Parent $scriptPath) -ChildPath "images/lab-images.json"

# Check if the JSON file exists
if (-not (Test-Path $jsonPath)) {
    Write-Error "Cannot find lab-images.json at: $jsonPath"
    exit 1
}

# Read and parse the JSON file
try {
    $labData = Get-Content -Path $jsonPath -Raw | ConvertFrom-Json
} catch {
    Write-Error "Failed to parse lab-images.json: $_"
    exit 1
}

# Determine which labs to process
$labsToProcess = @()
if ($All) {
    $labsToProcess = $labData.labs.PSObject.Properties.Name
    Write-Host "Processing all labs..." -ForegroundColor Green
} elseif ($Section) {
    # Check if the section exists
    if (-not $labData.sections.PSObject.Properties.Name -contains $Section) {
        Write-Warning "Section '$Section' not found in lab-images.json. Available sections:"
        $labData.sections.PSObject.Properties.Name | ForEach-Object { Write-Host "  - $_" }
        exit 1
    }
    
    # Get labs in the specified section
    $labsToProcess = $labData.sections.$Section
    Write-Host "Processing section: $Section" -ForegroundColor Green
    Write-Host "Labs in section: $($labsToProcess -join ', ')" -ForegroundColor Gray
} else {
    # Validate that requested labs exist
    foreach ($lab in $Labs) {
        if ($labData.labs.PSObject.Properties.Name -notcontains $lab) {
            Write-Warning "Lab '$lab' not found in lab-images.json. Available labs:"
            $labData.labs.PSObject.Properties.Name | ForEach-Object { Write-Host "  - $_" }
            exit 1
        }
    }
    $labsToProcess = $Labs
}

# Track pulled images to avoid duplicates
$pulledImages = @{}
$totalImages = 0
$failedImages = @()

# Process each lab
foreach ($lab in $labsToProcess) {
    $images = $labData.labs.$lab
    
    if ($images.Count -eq 0) {
        Write-Host "`nLab '$lab' has no images to pull" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`nProcessing lab: $lab" -ForegroundColor Cyan
    Write-Host "Found $($images.Count) image(s) to pull" -ForegroundColor Gray
    
    foreach ($image in $images) {
        if ($pulledImages.ContainsKey($image)) {
            Write-Host "  [SKIP] $image (already pulled)" -ForegroundColor DarkGray
            continue
        }
        
        Write-Host "  [PULL] $image" -ForegroundColor White -NoNewline
        
        try {
            # Pull the image
            $result = docker pull $image 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " ✓" -ForegroundColor Green
                $pulledImages[$image] = $true
                $totalImages++
            } else {
                Write-Host " ✗" -ForegroundColor Red
                Write-Host "         Error: $result" -ForegroundColor Red
                $failedImages += $image
            }
        } catch {
            Write-Host " ✗" -ForegroundColor Red
            Write-Host "         Error: $_" -ForegroundColor Red
            $failedImages += $image
        }
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Blue
Write-Host "Summary:" -ForegroundColor Blue
Write-Host "  Labs processed: $($labsToProcess.Count)" -ForegroundColor White
Write-Host "  Images pulled: $totalImages" -ForegroundColor Green
if ($failedImages.Count -gt 0) {
    Write-Host "  Failed images: $($failedImages.Count)" -ForegroundColor Red
    Write-Host "`nFailed to pull:" -ForegroundColor Red
    $failedImages | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}
Write-Host "========================================" -ForegroundColor Blue

# Exit with error code if any images failed
if ($failedImages.Count -gt 0) {
    exit 1
}