const fallbackImages = [
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  'https://images.unsplash.com/photo-1594042898950-c8e4a7c06eb1?w=800&q=80',
  'https://images.unsplash.com/photo-1613564998797-15d97f80f1d0?w=800&q=80',
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
