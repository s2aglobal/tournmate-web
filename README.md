# TournMate Website

Marketing landing page and legal documents for [TournMate](https://tournmate.com) — the all-in-one app for tournament hosting, open play sessions, court discovery, and calorie tracking.

## Structure

```
index.html      Landing page
terms.html      Terms & Conditions
privacy.html    Privacy Policy
css/style.css   Shared stylesheet
assets/         Static assets (app icon, images)
```

## Local Development

Open `index.html` directly in a browser, or use any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

## Deployment

This is a static site — deploy to any static hosting provider:

- **Netlify**: Connect the repo and deploy automatically
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Enable in repo settings
- **Custom server**: Upload files to your web root

Point `tournmate.com` DNS to your chosen host.

## License

Copyright © 2026 s2aglobalLLC. All rights reserved.
