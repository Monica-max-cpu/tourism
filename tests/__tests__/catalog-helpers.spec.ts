import {
  normalizeCatalogRecord,
  normalizeCatalogStatus,
  resolveCatalogCategoryText,
  resolveCatalogSupplierName,
  resolveCatalogUnit,
} from '/@/views/admin/catalogHelpers';

describe('catalog helpers', () => {
  it('normalizes flat catalog records and tolerates string status values', () => {
    const record = normalizeCatalogRecord({
      id: 'cat-1',
      productName: '苹果',
      supplierName: '山西果蔬',
      categoryName: '生鲜',
      unitLabel: '斤',
      status: '1',
      basePrice: 12.5,
      catalogTiers: [{ minQty: '1', maxQty: '10', unitPrice: '11.2' }],
    });

    expect(record.status).toBe(1);
    expect(record.preferredSupplierName).toBe('山西果蔬');
    expect(record.categoryName).toBe('生鲜');
    expect(record.unit).toBe('斤');
    expect(record.catalogTiers).toEqual([{ minQty: 1, maxQty: 10, unitPrice: 11.2 }]);
  });

  it('resolves nested supplier, category and unit aliases', () => {
    const row = {
      id: 'cat-2',
      productInfo: {
        productName: '牛奶',
        supplierName: '高原乳业',
        categoryLabel: '乳制品',
        unitName: '箱',
      },
      preferredQuote: {
        supplierName: '高原乳业',
        categoryName: '乳制品',
        unit: '箱',
      },
    };

    expect(resolveCatalogSupplierName(row)).toBe('高原乳业');
    expect(resolveCatalogCategoryText(row)).toBe('乳制品');
    expect(resolveCatalogUnit(row)).toBe('箱');
  });

  it('normalizes status values into the canonical catalog flags', () => {
    expect(normalizeCatalogStatus('1')).toBe(1);
    expect(normalizeCatalogStatus('0')).toBe(0);
    expect(normalizeCatalogStatus(undefined)).toBe(0);
  });
});
