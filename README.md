# Shivansh Self Drive

Modern self-drive car rental web application for Pune with premium UI, quotation generation, and WhatsApp-first booking communication.

## Overview

Shivansh Self Drive is built as a performance-focused single-page application using React + Vite. It combines a visually rich fleet discovery experience with an operational booking workflow that captures customer intent, validates rental constraints, and produces a ready-to-share PDF quotation.

The product emphasizes:

- Fast browsing and mobile responsiveness
- Transparent pricing display
- Minimal-friction customer booking flow
- Strong brand presentation
- Practical operations tooling (PDF + WhatsApp handoff)

## Core Capabilities

- Premium fleet listing with filter chips and category segmentation
- Car cards with image fallback behavior and quick booking CTA
- Booking modal with:
  - Pickup/dropoff selection
  - Customer details validation
  - Terms acceptance controls
  - Dual signature capture
- Automated quotation PDF generation with:
  - Brand logo
  - Payment QR
  - Booking details summary
  - Terms and customer signatures
- WhatsApp booking handoff with generated quotation support
- SEO/hosting-friendly static files (`robots.txt`, `sitemap.xml`, `_headers`, `.htaccess`)

## Technical Architecture

- Frontend framework: React 18
- Build tool: Vite 5
- Animation layer: Framer Motion
- Document generation: jsPDF
- Static asset strategy: Public folder serving via Vite

### Application Layers

- Presentation: `src/styles.css` (theme, layout, responsive behavior)
- View/Flow orchestration: `src/App.jsx`
- Data/config: `src/data/cars.js`
- Path helpers/utilities: `src/utils/paths.js`

## Repository Structure

```text
ShivanshSelfDrive/
  docs/                         # Project/deployment documentation
  public/
    assets/img/                 # Brand assets
    cars/                       # Vehicle images grouped by model folder
    media/                      # Icons, backgrounds, payment media
  src/
    data/                       # Fleet metadata and terms
    utils/                      # Utility/path helpers
    App.jsx                     # Primary UI + booking logic
    main.jsx                    # Application entrypoint
    styles.css                  # Styling system
  index.html
  package.json
  vite.config.js
  robots.txt
  sitemap.xml
  _headers
  .htaccess
```

## Booking Workflow (High Level)

1. Customer selects a vehicle from Fleet.
2. Booking modal collects schedule and customer identity.
3. Terms consent and signatures are captured.
4. Quotation PDF is generated from booking payload.
5. Booking message is prepared for WhatsApp submission.
6. Customer shares/attaches generated quote with operations contact.

## Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Deployment Notes

- Keep all static assets under `public/`.
- Ensure each car folder has a `main-photo.png` for reliable primary rendering.
- Use `docs/HOSTINGER_DEPLOYMENT.md` for hosting-specific guidance.
- Keep `_headers` and `.htaccess` aligned with hosting/CDN behavior.

## Operations Notes

- Pricing and terms content are managed in source data files and rendered in booking/PDF workflows.
- PDF generation depends on asset availability (logo and payment QR paths).
- WhatsApp flow uses prefilled messaging and may fall back to download-first sharing on unsupported share targets.

## Roadmap Ideas

- Backend booking persistence and admin dashboard
- Availability calendar and booking conflict checks
- Payment status integration
- Multilingual content and policy management via CMS
- Automated tests for booking and PDF generation paths

## License

Private project for Shivansh Self Drive operations and branding.
