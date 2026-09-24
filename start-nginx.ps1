# start-nginx.ps1 - Start, reload, or stop the Nginx Reverse Proxy server

param (
    [string]$Action = "start"
)

$nginxDir = Join-Path $PSScriptRoot "nginx\win\nginx-1.26.2"
$nginxExe = Join-Path $nginxDir "nginx.exe"

if (-not (Test-Path $nginxExe)) {
    Write-Host "Local Windows Nginx not found at $nginxExe." -ForegroundColor Red
    Write-Host "Falling back to Docker Compose..." -ForegroundColor Yellow
    docker compose -f docker-compose.nginx.yml up -d
    exit
}

switch ($Action.ToLower()) {
    "stop" {
        Write-Host "Stopping Nginx server..." -ForegroundColor Cyan
        Push-Location $nginxDir
        try {
            .\nginx.exe -s stop
            Write-Host "Nginx stopped." -ForegroundColor Green
        } finally {
            Pop-Location
        }
    }
    "reload" {
        Write-Host "Reloading Nginx configuration..." -ForegroundColor Cyan
        Push-Location $nginxDir
        try {
            .\nginx.exe -s reload
            Write-Host "Nginx reloaded successfully." -ForegroundColor Green
        } finally {
            Pop-Location
        }
    }
    default {
        # Check if already running on port 8088
        $portInUse = Get-NetTCPConnection -LocalPort 8088 -ErrorAction SilentlyContinue
        if ($portInUse) {
            Write-Host "Nginx is already running on http://localhost:8088." -ForegroundColor Green
            exit
        }

        Write-Host "Testing Nginx configuration..." -ForegroundColor Cyan
        Push-Location $nginxDir
        try {
            .\nginx.exe -t
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Nginx configuration test failed!" -ForegroundColor Red
                exit 1
            }
            Start-Process -FilePath ".\nginx.exe" -WorkingDirectory $nginxDir
            Start-Sleep -Seconds 1
            Write-Host "`nNginx server is running on http://localhost:8088" -ForegroundColor Green
            Write-Host "Protected routes enforced by Nginx:" -ForegroundColor Yellow
            Write-Host "  - /api/admin/*              -> Blocked unless valid Admin token provided (HTTP 401/403)"
            Write-Host "  - /api/orders/my-orders     -> Blocked unless valid User token provided (HTTP 401)"
            Write-Host "Proxied public routes:" -ForegroundColor Yellow
            Write-Host "  - /api/*                    -> Node/Express API (:5000)"
            Write-Host "  - /admin/                   -> Admin Portal (:5174)"
            Write-Host "  - /                         -> Customer Storefront (:5173)"
        } finally {
            Pop-Location
        }
    }
}
