# Sitemap delivery fix: Firebase Hosting + Cloudflare Pages

This patch explicitly declares sitemap/robots response metadata on both static hosting platforms. It does not guarantee indexing; Google must still fetch the sitemap successfully.

## Changed files
- `firebase.json`: exact-path Content-Type and Cache-Control headers for `/sitemap.xml` and `/robots.txt`.
- `public/_headers`: equivalent Cloudflare Pages rules; Vite copies this file into `dist/`.
- `public/sitemap.xml`: UTF-8 XML declaration ensured. Existing URLs and robots directives are preserved.

## Firebase Hosting
1. Run `npm run build`.
2. Deploy: `firebase deploy --only hosting`.
3. Verify `/sitemap.xml` returns HTTP 200, XML body, and `Content-Type: application/xml`.
4. Keep the actual `public/sitemap.xml` file. Firebase serves exact-match static content before SPA rewrites.

## Cloudflare Pages
1. Keep `sitemap.xml`, `robots.txt`, and `_headers` in the static `public/` directory copied to the build output.
2. Deploy a new Pages build and verify HTTP 200, XML body, and `Content-Type: application/xml`.
3. If verified Google crawlers receive a challenge/403/429, inspect Security Events and adjust only the relevant WAF/Bot rule for verified search crawlers. Do not disable all security or trust a spoofable User-Agent.

## Diagnostics for any host
```bash
curl -sS -D - -o /tmp/sitemap.xml https://YOUR_HOST/sitemap.xml
head -c 200 /tmp/sitemap.xml
curl -sS -D - -o /dev/null -A 'Googlebot' https://YOUR_HOST/sitemap.xml
```
A simulated Googlebot User-Agent is only a diagnostic, not proof of Google crawler access. The authoritative test is Search Console > URL Inspection > Test Live URL; `Page fetch` should be `Successful` and `Crawl allowed?` should be `Yes`.

## Search Console
After deployment, run the Live Test. If fetch succeeds, resubmit `sitemap.xml`. If it still fails, open the detailed error; possible causes include robots.txt blocking, 404, server errors, or temporary errors. Do not repeatedly resubmit without checking the exact failure.

Browser text saying the XML has no style information is normal, not an error.
