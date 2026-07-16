# K2KAI Social OS — SSL / TLS

The app requires HTTPS in production for secure cookies, OAuth redirects, the
service worker, and PWA install. Use **Let's Encrypt** (free, automated).

## Option A — certbot + NGINX

```bash
sudo apt -y install certbot python3-certbot-nginx
sudo certbot --nginx -d k2kai.enmasco.com
```

certbot edits the NGINX server block automatically and sets up renewal. Verify:

```bash
sudo certbot renew --dry-run
curl -I https://k2kai.enmasco.com/api/health   # Strict-Transport-Security header present
```

## Option B — Caddy (automatic)

Caddy obtains and renews certificates automatically from `deploy/Caddyfile`.
No extra step required beyond `caddy run --config deploy/Caddyfile`.

## Manual certificate (bring-your-own)

If using a commercial cert, place:

```
/etc/letsencrypt/live/k2kai.enmasco.com/fullchain.pem
/etc/letsencrypt/live/k2kai.enmasco.com/privkey.pem
```

and point `ssl_certificate` / `ssl_certificate_key` in `deploy/nginx.conf` to
them.

## HSTS

`deploy/nginx.conf` and `next.config.mjs` both emit:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

This forces browsers to use HTTPS for 2 years. Only enable `preload` after
you are certain the domain will always serve HTTPS.

## Renewal

- certbot: cron/systemd timer (installed automatically).
- Caddy: automatic.

## Verify

```bash
openssl s_client -connect k2kai.enmasco.com:443 | openssl x509 -noout -dates
curl -I https://k2kai.enmasco.com/ | grep -i strict-transport
```
