# =======================================================
# Healthcare Microservices - Kubernetes Deploy Script
# Run this from: d:\Microservices\healthcare-microservices
# Usage: .\deploy-k8s.ps1
# =======================================================

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Healthcare Microservices - K8s Deployer   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ---- STEP 1: Start Minikube ----
Write-Host "[1/5] Starting Minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status --format='{{.Host}}' 2>&1
if ($minikubeStatus -ne "Running") {
    minikube start --driver=docker --memory=4096 --cpus=4
    Write-Host "  Minikube started successfully!" -ForegroundColor Green
} else {
    Write-Host "  Minikube is already running." -ForegroundColor Green
}

# ---- STEP 2: Point Docker to Minikube's Docker daemon ----
Write-Host ""
Write-Host "[2/5] Configuring Docker to build inside Minikube..." -ForegroundColor Yellow
& minikube -p minikube docker-env --shell powershell | Invoke-Expression
Write-Host "  Docker environment configured." -ForegroundColor Green

# ---- STEP 3: Build all Docker images inside Minikube ----
Write-Host ""
Write-Host "[3/5] Building Docker images inside Minikube (this takes a few minutes)..." -ForegroundColor Yellow

$services = @(
    @{ name = "auth-service";         path = "auth-service" },
    @{ name = "patient-service";      path = "patient-service" },
    @{ name = "appointment-service";  path = "appointment-service" },
    @{ name = "billing-service";      path = "billing-service" },
    @{ name = "analytics-service";    path = "analytics-service" },
    @{ name = "doctor-service";       path = "doctor-service" },
    @{ name = "admin-service";        path = "admin-service" },
    @{ name = "review-service";       path = "review-service" },
    @{ name = "notification-service"; path = "notification-service" },
    @{ name = "ai-service";           path = "ai-service" },
    @{ name = "frontend";             path = "frontend" }
)

foreach ($svc in $services) {
    Write-Host "  Building $($svc.name)..." -ForegroundColor White
    docker build -t "$($svc.name):latest" "$ROOT\$($svc.path)"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    $($svc.name) built!" -ForegroundColor Green
    } else {
        Write-Host "    ERROR building $($svc.name)!" -ForegroundColor Red
        exit 1
    }
}

# ---- STEP 4: Apply all Kubernetes manifests ----
Write-Host ""
Write-Host "[4/5] Deploying all services to Kubernetes..." -ForegroundColor Yellow

$manifests = @(
    # Databases first
    "k8s\mongo-auth.yml",
    "k8s\mongo-patient.yml",
    "k8s\mongo-appointment.yml",
    "k8s\mongo-billing.yml",
    "k8s\mongo-doctor.yml",
    "k8s\mongo-admin.yml",
    "k8s\mongo-review.yml",
    # Core services
    "k8s\auth-service.yml",
    "k8s\patient-service.yml",
    "k8s\doctor-service.yml",
    "k8s\appointment-service.yml",
    "k8s\billing-service.yml",
    "k8s\admin-service.yml",
    "k8s\review-service.yml",
    "k8s\notification-service.yml",
    "k8s\analytics-service.yml",
    "k8s\ai-service.yml",
    # Frontend last
    "k8s\frontend.yml"
)

foreach ($manifest in $manifests) {
    Write-Host "  Applying $manifest..." -ForegroundColor White
    kubectl apply -f "$ROOT\$manifest"
}

# ---- STEP 5: Wait and show status ----
Write-Host ""
Write-Host "[5/5] Waiting for pods to start (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
kubectl get pods

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  SERVICES & PORTS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
kubectl get services

Write-Host ""
Write-Host "  Getting frontend URL..." -ForegroundColor Yellow
$frontendUrl = minikube service frontend --url
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  APP IS LIVE AT: $frontendUrl" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
