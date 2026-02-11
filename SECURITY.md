# Valentine's Invitation App - Security & Deployment Guide

## Local Development (Secure)

### Using the Secure Python Server
Instead of the basic Python HTTP server, use the secure server to prevent path exposure:

```bash
python server.py
```

This server:
- Prevents directory listing (403 Forbidden for directory requests)
- Adds security headers to all responses
- Routes `/` automatically to `index.html`
- Suppresses detailed path logging

## Deployment Guide

### Option 1: GitHub Pages (Recommended for Static Hosting)
1. Push your files to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your app will be available at `https://username.github.io/Valentines`

### Option 2: Netlify
1. Connect your GitHub repo to Netlify
2. Netlify automatically serves the app with security headers
3. Your app gets a secure HTTPS URL

### Option 3: Self-Hosted Server (Apache/Nginx)
1. Upload files to your server's public directory
2. For Apache: `.htaccess` file handles security headers and prevents directory listing
3. For Nginx: Configure server block with equivalent security settings

### Option 4: Other Static Hosts
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront
- Azure Static Web Apps

## Security Features Implemented

✅ **No Directory Listing** - Users cannot browse server directories
✅ **Security Headers** - Prevents MIME type sniffing, clickjacking, XSS attacks
✅ **CSP Policy** - Controls which scripts/styles can be loaded
✅ **Referrer Policy** - Prevents referrer leakage
✅ **Client-Side Only** - No sensitive data stored or transmitted to servers

## Important Notes

1. **File Paths**: When deployed via HTTP/HTTPS, file paths are never exposed to visitors
2. **Data Privacy**: All invitation data is passed through URL parameters—never stored on servers
3. **Photo Data**: Photos are compressed and encoded in URLs. Very large images may still create long URLs; compress them beforehand if needed
4. **Browser Console**: Clean console output with no path information

## Testing Locally

Start the secure server and visit `http://localhost:8000` to test:
1. Create an invitation with partner name, photo, and questions
2. Copy the generated link
3. Open in a new incognito window to test recipient view
4. Check browser developer tools—file paths won't be exposed

---
Enjoy creating beautiful Valentine's invitations! 💕
