# Hostinger Deployment Steps (shivanshselfdrive.com)

1. Add all car folders under public/cars and keep each car's official image as main-photo.png.
2. Run build locally:
   - npm install
   - npm run build
3. Open Hostinger hPanel -> Hosting -> Manage -> File Manager.
4. Go to public_html.
5. Upload all contents of dist/ into public_html.
6. Ensure these exist in public_html:
   - index.html
   - assets/
   - cars/
   - .htaccess
   - robots.txt
   - sitemap.xml
5. SSL: hPanel -> SSL -> Activate for shivanshselfdrive.com.
6. Verify HTTPS redirect (configured in .htaccess).
7. Submit sitemap in Google Search Console:
   - https://shivanshselfdrive.com/sitemap.xml
8. Test key paths:
   - https://shivanshselfdrive.com/
   - https://shivanshselfdrive.com/privacy.html

## Security Headers
- Apache uses .htaccess headers.
- Netlify can use _headers file.

## DNS (if needed)
- Point A record of shivanshselfdrive.com to Hostinger server IP from hPanel.
