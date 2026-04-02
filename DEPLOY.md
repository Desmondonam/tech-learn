# TechLearn LMS — Vercel Deployment Guide

This project is a Next.js 14 app already hosted on GitHub. Follow the steps below to deploy it to Vercel.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- Access to the GitHub repository for this project

---

## Step 1 — Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign in.
2. From the dashboard, click **Add New → Project**.
3. Under **Import Git Repository**, click **Continue with GitHub**.
4. Authorize Vercel to access your GitHub account if prompted.

---

## Step 2 — Import the Repository

1. Search for or select the **techlearn-lms** repository from the list.
2. Click **Import** next to it.

---

## Step 3 — Configure Build Settings

Vercel auto-detects Next.js. The `vercel.json` already in this repo sets the correct values. Verify the following settings on the configuration screen — **no changes should be needed**:

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `./` (leave as default) |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## Step 4 — Environment Variables

This project uses **no environment variables** — it runs entirely on mock data with no external services or database.

Leave the **Environment Variables** section empty and proceed.

---

## Step 5 — Deploy

1. Click **Deploy**.
2. Vercel will:
   - Clone the repository
   - Run `npm install`
   - Run `next build`
   - Publish the output to a global CDN
3. Wait approximately 1–3 minutes for the build to complete.
4. Once done, Vercel displays your live URL (e.g. `https://techlearn-lms.vercel.app`).

---

## Step 6 — Verify the Deployment

Open the live URL and log in with the demo credentials:

| Role | Email | Password |
|---|---|---|
| Student | `alex@student.com` | any value |
| Admin | `admin@techlearn.com` | any value |

---

## Step 7 — Set Up a Custom Domain (Optional)

1. In your Vercel project dashboard, go to **Settings → Domains**.
2. Click **Add Domain** and enter your custom domain (e.g. `techlearn.yourdomain.com`).
3. Follow the DNS instructions Vercel provides (add a CNAME or A record at your domain registrar).
4. Vercel automatically provisions an SSL certificate via Let's Encrypt.

---

## Automatic Re-Deployments

Once connected, every `git push` to the `main` branch triggers a new production deployment automatically. Pull requests get their own preview URLs for testing before merging.

---

## Deploying via Vercel CLI (Alternative)

If you prefer the command line:

```bash
# Install the Vercel CLI
npm install -g vercel

# Log in
vercel login

# Run from the project root — deploys a preview
vercel

# Deploy to production
vercel --prod
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails on TypeScript errors | Run `npm run build` locally first and fix all errors before pushing |
| Build fails on lint errors | Run `npm run lint` locally and resolve warnings/errors |
| Blank page after deploy | Check the **Functions** or **Logs** tab in the Vercel dashboard for runtime errors |
| Styles not loading | Ensure `tailwind.config.js` and `postcss.config.js` are committed and not in `.gitignore` |
