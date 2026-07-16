# K2KAI Social OS — Reverse Proxy (NGINX / Caddy)

Reference configs live in:

- `deploy/nginx.conf`
- `deploy/Caddyfile`

## NGINX

1. Install NGINX + Brotli (optional):
   ```bash
   sudo apt -y install nginx
   # brotli module: use nginx-full or a PPA; otherwise remove the brotli block
   ```
2. Deploy the site:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/k2kai
   sudo ln -s /etc/nginx/sites-available/k2kai /etc/nginx/sites-enabled/k2kai
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. What it does:
   - **HTTP → HTTPS** redirect (`return 301 https://$host$request_uri;`)
   - **TLS** via Let's Encrypt (see `ssl.md`)
   - **Gzip + Brotli** compression
   - **WebSocket upgrade** for the Socket.IO messenger bridge
   - **Long cache** for `/_next/static/` (content-hashed, immutable)
   - **No-cache** for `/service-worker.js` (with `Service-Worker-Allowed: /`)
   - **1-day cache** for `/manifest.webmanifest`
   - **Uploads** served from `/var/www/k2kai/public/uploads/`

4. If you change the upstream port, update `proxy_pass http://127.0.0.1:3000;`.

## Caddy (alternative)

```bash
sudo apt -y install caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy auto-obtains + renews TLS and redirects HTTP → HTTPS. It applies the
same compression, WebSocket, and cache-header behavior as the NGINX config.

## Notes

- The app **also** sets security headers in `next.config.mjs`; the proxy
  headers are defense-in-depth.
- Do not enable `proxy_buffering` for the Socket.IO path — connection upgrade
  must pass through (handled by the `Upgrade`/`Connection` headers above).
- Keep `X-Forwarded-Proto` correct so NextAuth issues secure cookies over HTTPS.
