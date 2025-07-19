# HTTPS Tunnel Options for Telegram Webhooks

Since Telegram requires HTTPS webhook URLs, you need to expose your local backend with HTTPS. Here are several options:

## 1. Cloudflare Tunnel (Recommended - Free)

### Setup:
1. Install Cloudflare CLI:
   ```bash
   npm install -g cloudflared
   ```

2. Login to Cloudflare:
   ```bash
   cloudflared tunnel login
   ```

3. Create a tunnel:
   ```bash
   cloudflared tunnel create ai-agent-tunnel
   ```

4. Configure the tunnel (create `tunnel.yml`):
   ```yaml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: /path/to/credentials.json
   
   ingress:
     - hostname: your-domain.trycloudflare.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. Run the tunnel:
   ```bash
   cloudflared tunnel run ai-agent-tunnel
   ```

6. Update your `.env` file:
   ```
   BASE_URL=https://your-domain.trycloudflare.com
   ```

## 2. LocalTunnel (Simple - Free)

### Setup:
1. Install LocalTunnel:
   ```bash
   npm install -g localtunnel
   ```

2. Start your backend server first, then run:
   ```bash
   lt --port 3000 --subdomain your-subdomain
   ```

3. Update your `.env` file:
   ```
   BASE_URL=https://your-subdomain.loca.lt
   ```

## 3. Serveo (Simple - Free)

### Setup:
1. Install Serveo:
   ```bash
   ssh -R 80:localhost:3000 serveo.net
   ```

2. Or use the web interface at serveo.net

3. Update your `.env` file with the provided URL

## 4. PageKite (Reliable - Free tier available)

### Setup:
1. Download PageKite from pagekite.net
2. Run:
   ```bash
   pagekite 3000 your-subdomain.pagekite.me
   ```

3. Update your `.env` file:
   ```
   BASE_URL=https://your-subdomain.pagekite.me
   ```

## 5. Expose (Modern alternative - Free)

### Setup:
1. Install Expose:
   ```bash
   composer global require beyondcode/expose
   ```

2. Run:
   ```bash
   expose share 3000
   ```

3. Update your `.env` file with the provided URL

## 6. Ngrok (Most popular - Free tier available)

### Setup:
1. Download ngrok from ngrok.com
2. Sign up for free account
3. Get your authtoken
4. Run:
   ```bash
   ngrok http 3000
   ```

5. Update your `.env` file:
   ```
   BASE_URL=https://your-ngrok-url.ngrok.io
   ```

## Quick Setup Script

Create a `start-tunnel.bat` (Windows) or `start-tunnel.sh` (Mac/Linux) file:

### Windows (start-tunnel.bat):
```batch
@echo off
echo Starting HTTPS tunnel...
echo.
echo Choose your tunnel service:
echo 1. Cloudflare Tunnel (Recommended)
echo 2. LocalTunnel
echo 3. Ngrok
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    echo Starting Cloudflare Tunnel...
    cloudflared tunnel run ai-agent-tunnel
) else if "%choice%"=="2" (
    echo Starting LocalTunnel...
    lt --port 3000 --subdomain ai-agent-api
) else if "%choice%"=="3" (
    echo Starting Ngrok...
    ngrok http 3000
) else (
    echo Invalid choice!
    pause
)
```

### Mac/Linux (start-tunnel.sh):
```bash
#!/bin/bash
echo "Starting HTTPS tunnel..."
echo ""
echo "Choose your tunnel service:"
echo "1. Cloudflare Tunnel (Recommended)"
echo "2. LocalTunnel"
echo "3. Ngrok"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo "Starting Cloudflare Tunnel..."
    cloudflared tunnel run ai-agent-tunnel
    ;;
  2)
    echo "Starting LocalTunnel..."
    lt --port 3000 --subdomain ai-agent-api
    ;;
  3)
    echo "Starting Ngrok..."
    ngrok http 3000
    ;;
  *)
    echo "Invalid choice!"
    ;;
esac
```

## Testing Your Tunnel

After setting up any tunnel, test it:

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Start your chosen tunnel service

3. Test the webhook endpoint:
   ```bash
   curl -X POST https://your-tunnel-url/webhook/test
   ```

4. Update your `.env` file with the tunnel URL

5. Try deploying to Telegram again

## Troubleshooting

- **Port already in use**: Make sure your backend is running on port 3000
- **Tunnel not working**: Try a different tunnel service
- **HTTPS errors**: Ensure you're using the HTTPS URL from the tunnel
- **Telegram webhook errors**: Check that the URL is accessible from the internet

## Recommended Workflow

1. Start your backend: `npm run dev`
2. Start your tunnel service
3. Update `.env` with the tunnel URL
4. Test webhook endpoint
5. Deploy to Telegram/WhatsApp
6. Keep tunnel running while testing 