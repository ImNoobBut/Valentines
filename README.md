# 💘 Valentine's Invitation Web App

A beautiful, interactive web application for creating and sharing personalized Valentine's Day invitations. Invite your special someone with custom questions, photos, and playful interactivity.

## ✨ Features

- **Creator Form** — Enter your partner's name, upload up to 2 photos, and add custom yes/no questions
- **Shareable Links** — Generate a unique URL to send your personalized invitation
- **Interactive Recipient Page** — Recipients see:
  - Personalized greeting with partner name
  - Dynamic question page with animated Yes/No buttons
  - Playful No button that runs away when clicked
  - Auto-return No button after 5 seconds of inactivity with wiggle animation
  - Final celebration page with floating photos
- **High-End Design** — Sophisticated minimalist aesthetic with:
  - Elegant color palette (burgundy, blush, soft accents)
  - Serif typography for headers, sans-serif for body
  - Smooth animations and transitions
  - Animated flowing gradient background
  - Floating heart decorations
  - Fireworks particle effects
- **Responsive Design** — Works beautifully on desktop and mobile devices
- **Accessibility** — Respects `prefers-reduced-motion` for users with motion sensitivities
- **Security** — CSP headers, no path exposure, base64 image encoding

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local development server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd Valentines
   ```

2. **Start the local development server**
   ```bash
   python server.py
   ```
   The server will run at `http://localhost:8000`

3. **Open in browser**
   Navigate to `http://localhost:8000` in your web browser

## 📝 How to Use

### For the Creator (You)

1. **Enter partner's name** in the text input field
2. **Upload photos** (1-4 images recommended):
   - Click "Choose Files" to select images
   - See preview thumbnails below the upload area
   - Images are automatically compressed to optimize URL length
3. **Add custom questions**:
   - Click "Add Question" to create new yes/no questions
   - Remove questions with the delete button
   - Questions appear in order on the invitation
4. **Generate shareable link**:
   - Click "Generate Invitation"
   - Copy the generated URL
   - Share via text, email, social media, etc.

### For the Recipient

1. **Click the link** sent to them
2. **See the greeting** with their name and your message
3. **Answer your questions**:
   - Click "Yes" to proceed to the next question
   - Try clicking "No" — it runs away!
   - After 5 seconds, the No button returns with a wiggle animation
4. **View the final celebration**:
   - Photos float gracefully across the screen
   - Enjoy the animated background with fireworks

## 🛠 Technology Stack

- **HTML5** — Semantic structure and forms
- **CSS3** — Advanced animations, gradients, and responsive design
  - `@keyframes` for smooth animations
  - CSS Grid and Flexbox for layout
  - CSS variables for theming
- **JavaScript (Vanilla)** — No frameworks
  - Canvas-based image compression
  - URL parameter handling with URLSearchParams
  - Dynamic DOM manipulation
- **Python** — Secure development server with CSP headers
  - `http.server` for local testing
  - Custom security headers
  - Directory listing disabled

## 🎨 Customization

### Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-red: #a23e48;      /* Main accent color */
    --dark-red: #6b2c34;         /* Darker variant */
    --blush: #f5e6e8;            /* Light pink */
    --light-grey: #fafafa;       /* Nearly white */
    --white: #ffffff;            /* Pure white */
    --dark-text: #2a2a2a;        /* Text color */
    --soft-accent: #d4a5a5;      /* Complementary accent */
    --no-gap: 24px;              /* Space between Yes/No buttons */
}
```

### Typography

- Headers use serif font (Playfair Display or Georgia fallback)
- Body uses system sans-serif (Inter, -apple-system, Segoe UI)

Edit font families in the `html` and `body` rules in `styles.css`.

### Animation Speed

- **Gradient flow**: Change `12s` in `gradientFlow` animation
- **Floating hearts**: Change `12s`/`14s` in `floatHeart` animation
- **Button evasion**: Change `NO_RETURN_DELAY = 5000` in `invite.js` (milliseconds)
- **Fireworks**: Adjust times in `fireworkBurst` keyframe animation

### Photo Compression

In `script.js`, adjust compression settings:

```javascript
const MAX_DIMENSION = 150;  // Max width/height in pixels (optimized for GitHub Pages)
const QUALITY = 0.35;       // JPEG quality (0.0-1.0) (ultra-aggressive compression)
```

**Current defaults**: 150px max, 35% quality, max 2 photos (optimized for GitHub Pages URL limits)

## 📱 Responsive Breakpoint

The app uses a mobile breakpoint at **640px width**. Adjust in `styles.css`:

```css
@media (max-width: 640px) {
    /* Mobile-specific styles */
}
```

## 🔒 Security

This application includes several security features:

- **Content Security Policy (CSP)** — Restricts resource loading
- **No Path Exposure** — Server doesn't log detailed file paths
- **Base64 Image Encoding** — Photos embedded in URLs, not stored server-side
- **HTTPS Ready** — Deploy with TLS/SSL for production

See [SECURITY.md](SECURITY.md) for detailed security information.

## 🌐 Deployment

### Option 1: GitHub Pages (Free)

1. Add `server.py` to `.gitignore`
2. Push to GitHub
3. Enable GitHub Pages in repository settings
4. Site will be live at `https://username.github.io/Valentines`

### Option 2: Netlify (Free)

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build command: (leave empty for static site)
4. Deploy directory: `/`
5. Site deployed automatically

### Option 3: Traditional Web Host (with cPanel)

1. Upload all files (except `server.py`) via FTP/SFTP
2. Create `.htaccess` with correct CSP headers (included)
3. Visit your domain

### Option 4: Docker (Advanced)

Create a `Dockerfile`:

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["python", "server.py"]
```

Build and run:

```bash
docker build -t valentines .
docker run -p 8000:8000 valentines
```

## 🐛 Troubleshooting

### "414 Request-URI Too Long" Error
**Solution**: The URL got too long (GitHub Pages has strict URL limits). Try:
- Use exactly 2 photos maximum (no more)
- Use simple, smaller image files (aim for 500x500px or less before upload)
- Use photos with minimal detail (solid backgrounds work better)
- Images are compressed to 150px at 35% quality — this is the minimum for safe URLs

**Why this happens**: All photo data is embedded in the URL (not stored on a server), so larger/more photos = exponentially longer URLs.

**Best practice for GitHub Pages**: 1-2 small, simple photos work best.

### Photos Not Showing on Recipient Page
**Solution**: Check browser console (F12) for errors. Ensure:
- CSP headers allow `data:` image sources
- Photos were properly compressed during upload
- Browser supports base64 image data

### No Button Not Moving/Returning
**Solution**: 
- Check that `invite.js` is loaded (see Network tab in DevTools)
- Ensure browser JavaScript is enabled
- Try a different browser

### Server Won't Start
**Solution**:
- Ensure Python 3.x is installed: `python --version`
- Check port 8000 is available: `netstat -ano | findstr 8000` (Windows)
- Try a different port by editing `server.py`

### Animations Too Fast/Slow on Mobile
**Solution**: 
- Users can enable "Reduce Motion" in OS settings (automatically disables animations)
- Adjust animation durations in `styles.css`
- Consider reducing on mobile with media queries

### Gradient Flowing in Wrong Direction
**Solution**: The gradient flows diagonally at 45 degrees. To change:
- Edit `linear-gradient(45deg, ...)` in body CSS
- Use `0deg` for vertical, `90deg` for horizontal, or other angles

## 📊 File Structure

```
Valentines/
├── index.html          # Creator form page
├── invite.html         # Recipient invitation page
├── styles.css          # All styling and animations
├── script.js           # Creator form logic & image compression
├── invite.js           # Recipient page logic & button behavior
├── server.py           # Local development server (Python)
├── .htaccess           # Apache web server configuration
├── SECURITY.md         # Security documentation
└── README.md           # This file
```

## 💾 How Data Works

### URL Parameter Format

The shareable link includes all data in URL parameters:

```
http://localhost:8000/invite.html?name=Alice&photos=[base64,base64,...]&questions=[...]
```

- **name**: Partner's name (URL encoded)
- **photos**: JSON array of base64-encoded images (JPEG, max 300px, 75% quality)
- **questions**: JSON array of question strings

All data is stored in the URL, **not** on a server!

## 🎯 Tips for Best Results

1. **Use high-quality photos** — They'll be compressed, so start with good originals
2. **Keep questions playful** — Short, fun yes/no questions work best
3. **Test before sending** — Check the generated link locally first
4. **Use short names** — Keeps the URL shorter
5. **Mobile testing** — Open the generated link on your phone before sharing

## 📄 License

This project is open source. Feel free to use, modify, and share!

## 💬 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [SECURITY.md](SECURITY.md) for security-related questions
3. Check browser console (F12) for error messages

---

**Made with ❤️ for Valentine's Day**

Happy inviting! 💕
