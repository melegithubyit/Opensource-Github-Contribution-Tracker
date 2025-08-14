# Open Source Contribution Tracker (Web App)

A simple, fast, and open-source web app to track any GitHub user's open-source contributions — without logging in.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license) [![Deploy](https://img.shields.io/badge/deploy-Vercel-informational)](#)  

## Features
- Search any GitHub user by username
- View public repositories count
- View followers count
- Fast fetch via GitHub REST API
- Responsive, minimal UI
- Zero auth required (public data only)
- Future: recent contributions graph (planned)
- Future: top languages (planned)
- Future: caching layer (planned)

## Live Demo
https://your-demo-url.example (replace with real deployment)

## Tech Stack
- Frontend: Next.js, Tailwind CSS
- API: GitHub REST API (unauthenticated or token mode)
- Deployment: Vercel (recommended)

## 📦 Installation
```bash
git clone https://github.com/melegithubyit/github-stat.git
cd github-stat
npm install
```

## ⚙️ Environment Variables
Create a `.env.local` (optional but increases rate limits):
```bash
GITHUB_TOKEN=ghp_your_personal_access_token_here
```
Scopes: no scopes required (public data). Without a token you are limited to low unauthenticated rate limits.

## 🚀 Quick Start
```bash
# Dev
npm run dev
# Lint
npm run lint
# Build
npm run build
# Start (prod)
npm start
```

## 🧪 Usage
1. Open the app.
2. Enter a GitHub username (e.g. torvalds, gaearon).
3. Press Search to load stats.

Rate limits:
- Unauthenticated: 60 requests/hour shared per IP.
- With token: 5000 requests/hour.

## 🗺 Roadmap
- [ ] Recent contribution calendar
- [ ] Language breakdown
- [ ] Star / fork counts
- [ ] Basic caching (ISR / edge KV)
- [ ] Dark mode toggle
- [ ] PWA support

## 🤝 Contributing
1. Fork
2. Create feature branch: `git checkout -b feat/xyz`
3. Commit: `git commit -m "feat: add xyz"`
4. Push & open PR

Please keep PRs focused and small.

## 🧾 License
MIT License. See `LICENSE` file.

## ❓ FAQ
Q: Why am I hitting rate limits?
A: Add a `GITHUB_TOKEN` to `.env.local`.

Q: Does this store user data?
A: No. All requests go directly to GitHub.

## 🙌 Acknowledgements
- GitHub REST API docs
- Next.js & Tailwind communities