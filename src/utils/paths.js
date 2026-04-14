export function imagePath(folder, file) {
  return encodeURI(`/cars/${folder}/${file}`);
}

export function mainPhotoPath(folder) {
  return encodeURI(`/cars/${folder}/main-photo.png`);
}

export function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
