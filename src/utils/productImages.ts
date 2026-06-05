export interface ProductImageSource {
  id?: string;
  productName?: string;
  categoryId?: string;
  productImages?: string;
}

function normalizeImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((url): url is string => typeof url === 'string' && !!url.trim()).map((url) => url.trim());
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function parseImages(raw?: string): string[] {
  if (!raw) return [];
  try {
    return normalizeImages(JSON.parse(raw));
  } catch {
    return normalizeImages(raw);
  }
}

export function getProductImages(item?: ProductImageSource | null): string[] {
  if (!item) return [];
  return parseImages(item.productImages);
}

export function getProductCover(item?: ProductImageSource | null): string {
  return getProductImages(item)[0] || '';
}
