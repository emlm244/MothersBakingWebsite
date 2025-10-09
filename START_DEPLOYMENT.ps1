# Chien's Treats - Automated Deployment Script
# Run this in PowerShell as Administrator

$ErrorActionPreference = "Stop"

# Configuration
$VPS_HOST = "109.205.180.240"
$VPS_USER = "root"
$VPS_PASS = "rX93hk15wCPOBx2uE"
$LOCAL_PATH = "C:\Users\bc200\MotherWebsite\chien-treats\deployment"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CHIEN'S TREATS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  This script should be run as Administrator for best results." -ForegroundColor Yellow
    Write-Host "   Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "📋 Pre-deployment checks..." -ForegroundColor Green
Write-Host ""

# Check if bootstrap script exists
if (-not (Test-Path "$LOCAL_PATH\bootstrap.sh")) {
    Write-Host "❌ ERROR: bootstrap.sh not found at $LOCAL_PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Bootstrap script found" -ForegroundColor Green

# Check if scp is available
$scpAvailable = Get-Command scp -ErrorAction SilentlyContinue
if (-not $scpAvailable) {
    Write-Host "❌ ERROR: 'scp' command not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install OpenSSH Client:" -ForegroundColor Yellow
    Write-Host "  1. Open Settings → Apps → Optional Features" -ForegroundColor Yellow
    Write-Host "  2. Add a feature → OpenSSH Client → Install" -ForegroundColor Yellow
    Write-Host "  3. Restart PowerShell and run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OR follow manual instructions in DEPLOY_NOW.md" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ OpenSSH Client available" -ForegroundColor Green

# Check if ssh is available
$sshAvailable = Get-Command ssh -ErrorAction SilentlyContinue
if (-not $sshAvailable) {
    Write-Host "❌ ERROR: 'ssh' command not found" -ForegroundColor Red
    exit 1
}
Write-Host "✅ SSH client available" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 1: TRANSFER BOOTSTRAP SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Transferring bootstrap.sh to VPS..." -ForegroundColor Yellow
Write-Host "Host: $VPS_HOST" -ForegroundColor Gray
Write-Host "User: $VPS_USER" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  You will be prompted for the password:" -ForegroundColor Yellow
Write-Host "    Password: $VPS_PASS" -ForegroundColor Cyan
Write-Host ""

# Transfer bootstrap script
try {
    scp "$LOCAL_PATH\bootstrap.sh" "${VPS_USER}@${VPS_HOST}:/root/"
    Write-Host ""
    Write-Host "✅ Bootstrap script transferred successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Failed to transfer bootstrap script" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual command:" -ForegroundColor Yellow
    Write-Host "scp $LOCAL_PATH\bootstrap.sh ${VPS_USER}@${VPS_HOST}:/root/" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 2: EXECUTE BOOTSTRAP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Connecting to VPS and executing bootstrap..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  You will be prompted for the password again:" -ForegroundColor Yellow
Write-Host "    Password: $VPS_PASS" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  This will take 10-15 minutes. Please wait..." -ForegroundColor Yellow
Write-Host ""

# Create a temporary SSH command file
$sshCommands = @"
cd /root
chmod +x bootstrap.sh
bash bootstrap.sh 2>&1 | tee bootstrap.log
"@

$tempFile = [System.IO.Path]::GetTempFileName()
$sshCommands | Out-File -FilePath $tempFile -Encoding ASCII

Write-Host "Executing bootstrap commands on VPS..." -ForegroundColor Yellow
Write-Host ""

# Execute bootstrap via SSH
try {
    ssh "${VPS_USER}@${VPS_HOST}" "cd /root && chmod +x bootstrap.sh && bash bootstrap.sh 2>&1 | tee bootstrap.log"
    Write-Host ""
    Write-Host "✅ Bootstrap completed successfully!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Bootstrap execution failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "To investigate, SSH to VPS and check:" -ForegroundColor Yellow
    Write-Host "  ssh ${VPS_USER}@${VPS_HOST}" -ForegroundColor Cyan
    Write-Host "  cat /root/bootstrap.log" -ForegroundColor Cyan
    exit 1
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PHASE 3: VERIFY BOOTSTRAP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verifying bootstrap installation..." -ForegroundColor Yellow
Write-Host ""

# Verify Node.js installation
Write-Host "Checking Node.js..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_HOST}" "node --version" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node.js check failed" -ForegroundColor Yellow
}

# Verify pnpm installation
Write-Host "Checking pnpm..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_HOST}" "pnpm --version" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ pnpm installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  pnpm check failed" -ForegroundColor Yellow
}

# Verify PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_HOST}" "systemctl is-active postgresql" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL check failed" -ForegroundColor Yellow
}

# Verify Nginx
Write-Host "Checking Nginx..." -ForegroundColor Gray
ssh "${VPS_USER}@${VPS_HOST}" "nginx -v" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Nginx installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Nginx check failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BOOTSTRAP COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✨ Phase 1 (Bootstrap) completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Follow DEPLOY_NOW.md starting at:" -ForegroundColor White
Write-Host "   → Phase 2: Configuration (Step 4)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Generate SSH deploy key" -ForegroundColor White
Write-Host "3. Configure environment files" -ForegroundColor White
Write-Host "4. Obtain TLS certificates" -ForegroundColor White
Write-Host "5. Run first deployment" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Full guide: DEPLOY_NOW.md" -ForegroundColor Gray
Write-Host ""
Write-Host "To continue manually, SSH to VPS:" -ForegroundColor Yellow
Write-Host "  ssh ${VPS_USER}@${VPS_HOST}" -ForegroundColor Cyan
Write-Host "  Password: $VPS_PASS" -ForegroundColor Cyan
Write-Host ""

# Pause before closing
Write-Host "Press Enter to exit..." -ForegroundColor Gray
$null = Read-Host
