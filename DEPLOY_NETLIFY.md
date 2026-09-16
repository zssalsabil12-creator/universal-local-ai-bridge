# ULAB — Netlify Deployment

## Build settings

- Provider: Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: 22
- Repository root: project root

## Deploy with GitHub

1. Create a GitHub repository and push this project.
2. In Netlify choose **Add new project → Import an existing project**.
3. Select GitHub and choose the ULAB repository.
4. Confirm the build settings above.
5. Add `VITE_ADSENSE_CLIENT` only after Google AdSense provides the real publisher ID.
6. Add `VITE_ADSENSE_SLOT` only after the real ad slot is available.
7. Deploy the site.

## Download endpoints

The website serves the Windows installer from `/downloads/ULAB-Setup.exe` and the portable package from `/downloads/ULAB-Windows.zip`.

The local Agent is not hosted by Netlify. Users download and run the Windows Agent locally; the website remains the public landing/download surface.

## Domain and SEO

The repository intentionally contains no assumed production domain. After the first deployment, choose the final public domain and update the canonical, Open Graph, Twitter, `robots.txt`, and sitemap URLs with that exact domain.

Netlify automatically provisions HTTPS for the deployed site.

## Release updates

After each release, rebuild the Windows artifacts, run the quality gates, run `npm run build`, verify the generated download files, and push the release commit. Netlify will create the new deployment from the configured production branch.
