const fallbackImages = [
  '/wooden_jewellery_box.jpg',
  '/minimalist_desk_organizer.jpg',
  '/ceramic_vase_set.jpg',
];

export const fallbackProductImage = (productId) => {
  const index = Math.abs((Number(productId) || 1) - 1) % fallbackImages.length;
  return fallbackImages[index];
};

export const replaceWithFallbackImage = (event, productId) => {
  const image = event.currentTarget;
  const fallback = fallbackProductImage(productId);
  if (image.src.endsWith(fallback)) return;
  image.src = fallback;
};
