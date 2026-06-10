import { storeCategoryLabel } from '/@/constants/storeStatus';
import type { CatalogStatus, CatalogTier, PlatformCatalog } from '/#/b2b';

function firstDefined<T>(...values: T[]): T | undefined {
  return values.find((value) => value !== undefined && value !== null && value !== '') as T | undefined;
}

function getNestedProduct(row: any) {
  return row?.product || row?.productInfo || row?.productDetail || {};
}

function getNestedQuote(row: any) {
  return row?.quote || row?.preferredQuote || row?.quoteInfo || {};
}

function normalizeTiers(raw: any): CatalogTier[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((tier: any) => ({
    minQty: Number(tier.minQty ?? tier.minOrderQty ?? 1),
    maxQty: tier.maxQty === null || tier.maxQty === undefined || tier.maxQty === '' ? null : Number(tier.maxQty),
    unitPrice: Number(tier.unitPrice ?? tier.price ?? tier.basePrice ?? 0),
  }));
}

export function normalizeCatalogStatus(status: unknown): CatalogStatus {
  const value = Number(status);
  if (value === 1 || value === 2) return value;
  return 0;
}

export function resolveCatalogSupplierName(row: any): string {
  const product = getNestedProduct(row);
  const quote = getNestedQuote(row);
  return String(
    firstDefined(
      row?.supplierName,
      row?.preferredSupplierName,
      row?.supplier?.supplierName,
      row?.supplier?.name,
      row?.supplier?.companyName,
      quote?.supplierName,
      quote?.supplier?.supplierName,
      quote?.supplier?.name,
      product?.supplierName,
      product?.supplier?.supplierName,
      product?.supplier?.name,
      row?.supplierId,
      row?.preferredSupplierId,
      quote?.supplierId,
      product?.supplierId,
      '-',
    ) ?? '-',
  );
}

export function resolveCatalogCategoryId(row: any): string {
  const product = getNestedProduct(row);
  const quote = getNestedQuote(row);
  return String(
    firstDefined(
      row?.categoryId,
      row?.productCategoryId,
      row?.category,
      product?.categoryId,
      product?.productCategoryId,
      product?.category,
      quote?.categoryId,
      quote?.productCategoryId,
      quote?.category,
      '',
    ) ?? '',
  );
}

export function resolveCatalogCategoryText(row: any): string {
  const product = getNestedProduct(row);
  const quote = getNestedQuote(row);
  const categoryId = resolveCatalogCategoryId(row);
  return String(
    firstDefined(
      row?.categoryName,
      row?.categoryLabel,
      row?.productCategoryName,
      row?.productCategoryLabel,
      product?.categoryName,
      product?.categoryLabel,
      product?.productCategoryName,
      product?.productCategoryLabel,
      quote?.categoryName,
      quote?.categoryLabel,
      quote?.productCategoryName,
      quote?.productCategoryLabel,
      categoryId ? storeCategoryLabel(categoryId) : '',
      '-',
    ) ?? '-',
  );
}

export function resolveCatalogUnit(row: any): string {
  const product = getNestedProduct(row);
  const quote = getNestedQuote(row);
  return String(
    firstDefined(
      row?.unit,
      row?.unitName,
      row?.unitLabel,
      product?.unit,
      product?.unitName,
      product?.unitLabel,
      quote?.unit,
      quote?.unitName,
      quote?.unitLabel,
      '件',
    ) ?? '件',
  );
}

export function normalizeCatalogRecord(row: any): PlatformCatalog {
  const product = getNestedProduct(row);
  const quote = getNestedQuote(row);
  const productImageList = row?.productImageList || product?.productImageList || quote?.productImageList || [];
  const productImages =
    row?.productImages ||
    row?.images ||
    product?.productImages ||
    product?.images ||
    quote?.productImages ||
    quote?.images ||
    '';
  const unit = resolveCatalogUnit(row);

  return {
    ...row,
    status: normalizeCatalogStatus(row?.status),
    productName: row?.productName || product?.productName || quote?.productName || '-',
    supplierName: resolveCatalogSupplierName(row),
    productImageList,
    productImages,
    categoryId: resolveCatalogCategoryId(row),
    unit,
    minOrderQty: row?.minOrderQty ?? quote?.minOrderQty ?? quote?.minQty ?? 1,
    basePrice: row?.basePrice ?? row?.salePrice ?? 0,
    supplierBasePrice: row?.supplierBasePrice ?? quote?.basePrice ?? quote?.costPrice ?? quote?.price ?? 0,
    preferredSupplierName: resolveCatalogSupplierName(row),
    categoryName: resolveCatalogCategoryText(row),
    catalogTiers: normalizeTiers(row?.catalogTiers || row?.tiers || quote?.tiers),
  };
}
