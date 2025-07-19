@echo off
echo ========================================
echo    AI Agent API - HTTPS Tunnel Setup
echo ========================================
echo.
echo Choose your tunnel service:
echo.
echo 1. Cloudflare Tunnel (Recommended - Free)
echo 2. LocalTunnel (Simple - Free)
echo 3. Ngrok (Popular - Free tier)
echo 4. Serveo (SSH-based - Free)
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starting Cloudflare Tunnel...
    echo Make sure you have cloudflared installed: npm install -g cloudflared
    echo.
    cloudflared tunnel run ai-agent-tunnel
) else if "%choice%"=="2" (
    echo.
    echo Starting LocalTunnel...
    echo Make sure you have localtunnel installed: npm install -g localtunnel
    echo.
    lt --port 3000 --subdomain ai-agent-api
) else if "%choice%"=="3" (
    echo.
    echo Starting Ngrok...
    echo Make sure you have ngrok installed and configured
    echo.
    ngrok http 3000
) else if "%choice%"=="4" (
    echo.
    echo Starting Serveo...
    echo This will open an SSH connection to serveo.net
    echo.
    ssh -R 80:localhost:3000 serveo.net
) else (
    echo.
    echo Invalid choice! Please run the script again.
    echo.
    pause
) 