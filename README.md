# PilotKYC documentation site

Public landing page and API documentation for **PilotKYC**, a hosted identity verification API (document check, selfie + document with face match and passive liveness).

- Site: https://pilotkyc.github.io/
- Source: https://github.com/pilotkyc/pilotkyc.github.io
- API base URL shown in the docs: `https://kyc-api.pilotbot.net/v1`

It is a plain static site: no build step, no framework, no external JavaScript. All links are relative, so it works at a root (`https://pilotkyc.github.io/`, `https://kyc.pilotbot.net/`) and under a sub-path.

## Layout

```
index.html              Landing page (EN default, RU toggle)
404.html                Not-found page (computes the site root at runtime)
openapi.yaml            OpenAPI spec (copied in from the PilotKYC API repository)
.nojekyll               Tell GitHub Pages not to run Jekyll
assets/
  site-config.js        Base URL, contact link, version, pricing (edit here)
  landing.css|js        Landing page styles, RU dictionary, theme/lang toggles
  favicon.svg
docs/
  index.html            Documentation app (markdown rendered in the browser)
  assets/docs.css|js    Docs styles and renderer
  assets/vendor/        marked.min.js (vendored)
  content/              One .md file per page + manifest.json (sidebar order)
```

## Change the base URL, price or contact link

Edit `assets/site-config.js`. It is the single place for:

- `baseUrl` / `apiOrigin`: used for `{{BASE_URL}}` and `{{API_ORIGIN}}` in every docs page and in the landing page snippet
- `contactUrl`: the "Get API keys" button and `{{CONTACT_URL}}` in the docs
- `pricing`: the landing page price cards
- `version`

## Edit the docs

Pages live in `docs/content/*.md`; the sidebar order is `docs/content/manifest.json`. To add a page, create the `.md` file and add an entry to the manifest. Placeholders available in markdown: `{{BASE_URL}}`, `{{API_ORIGIN}}`, `{{VERSION}}`, `{{CONTACT_URL}}`, `{{OPENAPI_URL}}`, `{{SWAGGER_URL}}`. Callouts use `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!DANGER]`. Consecutive code fences with `tab="Name"` become tabs.

## Preview locally

```bash
cd pilotkyc-docs
python3 -m http.server 8720
# open http://localhost:8720/ and http://localhost:8720/docs/
```

Do not open the files with `file://`: the docs fetch their markdown over HTTP.

## Publish with GitHub Pages

1. Create the repository `pilotkyc/pilotkyc.github.io` (an organization site, served at the root `https://pilotkyc.github.io/`).
2. Push this folder to branch `main`.
3. In **Settings > Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. The site is live at https://pilotkyc.github.io/ after the first build.

## Attach the custom domain `kyc.pilotbot.net` later

1. In Cloudflare DNS add a record: type `CNAME`, name `kyc`, target `pilotkyc.github.io`. Set it to **DNS only** (grey cloud) first so GitHub can issue the HTTPS certificate.
2. Add a file named `CNAME` to the repository root containing exactly `kyc.pilotbot.net` (or set the custom domain in **Settings > Pages**, which creates the file).
3. Wait until GitHub shows the domain as verified, then enable **Enforce HTTPS**.
4. Only after the certificate is issued, you may switch the Cloudflare record to proxied (orange cloud) if you want it.

No file needs to change for the domain move: links are relative. The only absolute paths are in `404.html` (`SITE_ROOT = "/"`, correct for any root site; change it only if the site is ever served from a sub-path).
