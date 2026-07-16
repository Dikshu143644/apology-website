# Only For Dikshu - Apology Website

A romantic, media-rich apology and memory website built for Dikshu. The app combines heartfelt sections, animated visuals, music, image/video memories, Google Photos links, a forgiveness response flow, and a small admin dashboard.

## Features

- Animated React landing experience with cinematic sections and romantic visual effects
- 3D / motion components for the bell jar, butterflies, petals, and interactive ambience
- Memory gallery with local photos, local videos, and external Google Photos albums
- Audio player with bundled apology-themed songs
- Login flow that records visitor login attempts locally or in Netlify Blobs
- Forgiveness response buttons that save `yes` / `thinking` responses
- Admin panel for viewing and clearing login users, login attempts, and responses
- Express server for local/full-stack runs and Netlify Function API for deployment

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Tailwind CSS
- Three.js / React Three Fiber / Drei
- Motion
- Express
- Netlify Functions and Netlify Blobs

## Project Structure

```text
src/
  App.tsx                    Main page flow and modal orchestration
  components/                UI, gallery, audio, admin, animation components
  assets/images/             Source and optimized feature images
public/
  image/                     Memory images and video thumbnails
  music/                     Audio files
  video/                     Memory videos
netlify/functions/api.ts     Netlify API implementation
server.ts                    Local Express server and Vite middleware
```

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Available variables:

```text
ADMIN_PASSCODE=change-this-admin-passcode
GOOGLE_PHOTOS_URL=https://photos.app.goo.gl/tzRAJ8o9uzezd64g8
GOOGLE_PHOTOS_URL_2=https://photos.app.goo.gl/B3Y6wpJCWPKFuPXo6
```

`ADMIN_PASSCODE` protects the admin dashboard and admin API actions. Change it before deploying.

## Local Development

Install dependencies:

```bash
npm install
```

Run the full local app with the Express server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

## API Routes

The local Express server and Netlify function expose similar routes:

- `GET /api/settings/public` - returns public Google Photos links
- `POST /api/login` - records or restores visitor login information
- `POST /api/forgive` - records forgiveness response choices
- `POST /api/admin/auth` - validates admin passcode
- `GET /api/admin/dashboard` - returns dashboard data
- `POST /api/admin/settings/login` - updates login settings
- `POST /api/admin/login-users/clear` - clears login users
- `POST /api/admin/responses/clear` - clears forgiveness responses
- `POST /api/admin/login-attempts/clear` - clears login attempts

## Persistence

Local development stores data in JSON files in the project root:

- `responses.json`
- `login-users.json`
- `login-attempts.json`

Netlify deployment stores data in a Netlify Blob store named `apology-site-data`.

## Deployment

This repo includes `netlify.toml`.

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Set the environment variables in Netlify before deploying, especially `ADMIN_PASSCODE`.

## Notes

The site is personal and emotional by design. Before publishing publicly, review all photos, videos, music files, and written messages to make sure they are okay to share.
