# Shivansh Self Drive

Premium self-drive car rental website for Pune, built with React and Vite.

## Features

- Fleet listing with car cards and image fallbacks
- Animated action icons for booking, contact, and map links
- Booking flow with modal, digital signatures, and terms acceptance
- Quotation PDF generation with logo, payment QR code, English terms, and signatures
- WhatsApp sharing flow for booking requests
- Polished English terms and conditions
- Responsive layout for desktop and mobile

## Tech Stack

- React 18
- Vite
- Framer Motion
- jsPDF

## Project Structure

```text
ShivanshSelfDrive/
  README.md
  index.html
  package.json
  vite.config.js
  public/
    assets/
      img/
        logo.jpeg
    media/
      backgrounds/
        13820721_3840_2160_30fps.mp4
        6872095-uhd_3840_2160_25fps.mp4
      icons/
        booking.mp4
        contact.mp4
        map.mp4
      payment/
        PaymentQR.jpeg
    cars/
      ...car folders with images and main-photo.png
  src/
    App.jsx
    main.jsx
    styles.css
    data/
      cars.js
    utils/
      paths.js
  docs/
    HOSTINGER_DEPLOYMENT.md
    PROJECT_STRUCTURE.md
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Booking Flow

- Select a car from the fleet.
- The booking modal opens with booking details, terms, and signature capture.
- The quotation PDF is generated with the company logo, payment QR code, polished English terms, and signatures at the bottom.
- The PDF file name uses the customer name.
- WhatsApp sharing is triggered with the booking message.

## Contact

The site includes a dedicated contact section for Sai Randive:

- Sai Randive (Pune)
- 9175799251
- sai.randive.btech2024@sitpune.edu.in

## Deployment Notes

- Keep the assets inside `public/` so Vite serves them correctly.
- The animated icons and background videos live under `public/media/`.
- Each car folder should contain a `main-photo.png` file for the primary image fallback.
- Review `docs/HOSTINGER_DEPLOYMENT.md` before hosting.

## License

This project is intended for the Shivansh Self Drive website.
"# Shivansh_Car_Retal"  
