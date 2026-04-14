# Project Structure

## Root
- index.html
- package.json
- package-lock.json
- vite.config.js
- .htaccess
- _headers
- robots.txt
- sitemap.xml
- src/
- public/
- docs/

## React Source (src)
- src/main.jsx
- src/App.jsx
- src/styles.css
- src/data/cars.js
- src/utils/paths.js

## Public Static Assets
- public/assets/img/logo.jpeg
- public/cars/<Car Folder>/main-photo.png
- public/cars/<Car Folder>/other photos (optional fallback)

## Fleet Folder Names (inside public/cars)
- Hyundai i20 Petrol/
- Hyundai Venue Sunroof/
- Hyundai Verna Diesel/
- Suzuki Baleno Petrol/
- Suzuki Brezza/
- Suzuki Ertiga/
- Suzuki Ertiga diesel/
- Suzuki Ertiga Petrol & CNG/
- Suzuki Fronx/
- Suzuki swift petrol/
- Suzuki Swift ZXI/
- Suzuki Wagon R/
- Suzuki XL6/
- Tata Nexon Petrol & CNG/

## Notes
- Place each car's official image as: main-photo.png in its folder.
- App auto-loads main-photo.png first and uses fallback image if missing.
- For deployment, upload build output from dist/.
