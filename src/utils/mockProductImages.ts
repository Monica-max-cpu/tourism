export interface ProductImageSource {
  id?: string;
  productName?: string;
  categoryId?: string;
  productImages?: string;
}

const REMOTE_PRODUCT_IMAGE_GROUPS = [
  [
    'https://images.pexels.com/photos/6958457/pexels-photo-6958457.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/6958448/pexels-photo-6958448.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/15785724/pexels-photo-15785724.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  [
    'https://images.pexels.com/photos/1561146/pexels-photo-1561146.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/20192283/pexels-photo-20192283.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://cdn.pixabay.com/photo/2017/06/20/23/55/gift-box-2425702_1280.jpg',
  ],
  [
    'https://images.pexels.com/photos/3735149/pexels-photo-3735149.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/4464819/pexels-photo-4464819.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
  [
    'https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=900',
    'https://images.pexels.com/photos/7319327/pexels-photo-7319327.jpeg?auto=compress&cs=tinysrgb&w=900',
  ],
];

function hashText(text: string): number {
  return Array.from(text).reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 0);
}

function parseImages(raw?: string): string[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((url): url is string => typeof url === 'string' && !!url) : [];
  } catch {
    return [];
  }
}

function getRemoteImages(item: ProductImageSource): string[] {
  const seed = hashText(`${item.id || ''}-${item.productName || ''}-${item.categoryId || ''}`);
  return REMOTE_PRODUCT_IMAGE_GROUPS[seed % REMOTE_PRODUCT_IMAGE_GROUPS.length];
}

export function getProductImages(item?: ProductImageSource | null): string[] {
  if (!item) return [];
  const realImages = parseImages(item.productImages);
  if (realImages.length) return realImages;
  return getRemoteImages(item);
}

export function getProductCover(item?: ProductImageSource | null): string {
  return getProductImages(item)[0] || '';
}
