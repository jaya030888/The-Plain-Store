const fallbackImages = [
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80',
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
];

export const fallbackProductImage = (productId) => {
  const index = Math.abs((Number(productId) || 1) - 1) % fallbackImages.length;
  return fallbackImages[index];
};

export const replaceWithFallbackImage = (event, productId) => {
  const image = event.currentTarget;
  const fallback = fallbackProductImage(productId);
  if (image.src === fallback) return;
  image.src = fallback;
};
