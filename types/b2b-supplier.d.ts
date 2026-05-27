/**
 * 阶段 3 - 供应商端业务类型
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端类型
 * 价格隔离原则：
 *  - 供应商可见：自己的成本价（即报价价 costPrice）
 *  - 供应商不可见：销售价（salePrice）、毛利（profit）、毛利率
 *  - 列表查询统一带 supplierId = currentUser.supplierId 强制过滤
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商端类型
 */

// ===== 供应商商品库（自营 SKU）=====
/** 0=停用 1=启用 */
export type SupplierProductStatus = 0 | 1;

export interface SupplierProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  brand: string;
  spec: string;
  unit: string;
  barcode: string;
  categoryId: string;
  images: string;
  description?: string;
  status: SupplierProductStatus;
  createTime: string;
}

// ===== 供应商报价 =====
/**
 * 供应商视角的报价状态
 *  - DRAFT     草稿（未提交）
 *  - PENDING   待平台审核
 *  - APPROVED  审核通过（已上架可被集采）
 *  - REJECTED  审核驳回
 *  - EXPIRED   过期
 *  - OFF       已下架（供应商主动下架）
 */
export type SupplierQuoteStatus = 0 | 1 | 2 | 3;

export interface SupplierQuoteRecord {
  id: string;
  quoteNo: string;
  supplierId: string;
  productId: string;
  productSku: string;
  productName: string;
  unit: string;
  /** 我的报价（成本价） */
  costPrice: number;
  validFrom: string;
  validTo: string;
  /** 起订量 */
  minQty?: number;
  status: SupplierQuoteStatus;
  remark?: string;
  rejectReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface QuoteTier {
  minQty: number;
  maxQty?: number | null;
  unitPrice: number;
}

export interface SupplierQuoteCreateParams {
  supplierId: string;
  productId: string;
  minOrderQty: number;
  basePrice: number;
  validFrom: string;
  validTo: string;
  currency?: string;
  leadTimeDays?: number;
  remark?: string;
  tiers?: QuoteTier[];
}

// ===== 供应商集采单 =====
/**
 * 供应商视角的集采单状态（继承自管理员侧 CollectiveStatus 的子集，剔除 PENDING）
 *  - TRIGGERED  待我确认
 *  - CONFIRMED  我已确认，待发货
 *  - SHIPPING   配送中
 *  - COMPLETED  已完成（已结算）
 *  - CANCELLED  已取消
 */
export type SupplierOrderStatus = 'TRIGGERED' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export interface SupplierOrderItem {
  productSku: string;
  productName: string;
  unit: string;
  qty: number;
  /** 成本价（供应商成交价） */
  costPrice: number;
  subtotal: number;
}

export interface SupplierOrder {
  id: string;
  collectiveNo: string;
  supplierId: string;
  /** 关联门店订单数（不展示明细给供应商） */
  storeOrderCount: number;
  status: SupplierOrderStatus;
  items: SupplierOrderItem[];
  /** 应收金额（采购成本 = 我的报价 × 数量） */
  purchaseAmount: number;
  /** 物流信息（CONFIRMED → SHIPPING 时写入） */
  carrier?: string;
  trackingNo?: string;
  triggeredAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  remark?: string;
}

// ===== 供应商发货任务 =====
export type ShipmentStatus = 'PENDING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION';

export interface ShipmentRecord {
  id: string;
  shipmentNo: string;
  supplierId: string;
  collectiveOrderId: string;
  collectiveNo: string;
  /** 商品信息（汇总） */
  productSummary: string;
  totalQty: number;
  carrier?: string;
  trackingNo?: string;
  status: ShipmentStatus;
  shippedAt?: string;
  deliveredAt?: string;
  exceptionReason?: string;
  remark?: string;
}

export interface ShipParams {
  collectiveOrderId: string;
  carrier: string;
  trackingNo: string;
  remark?: string;
}

// ===== 供应商仓库 =====
export interface SupplierWarehouse {
  id: string;
  supplierId: string;
  warehouseName: string;
  province?: string;
  city?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  isDefault: 0 | 1;
  createTime?: string;
}

// ===== 供应商库存 =====
export type SupplierStockHealth = 'NORMAL' | 'LOW' | 'OUT';

export interface SupplierStock {
  id: string;
  supplierId: string;
  productId?: string;
  productSku: string;
  productName: string;
  unit: string;
  warehouseId?: string;
  warehouseName?: string;
  /** 可用库存 */
  availableQty: number;
  /** 锁定库存（已被集采占用） */
  lockedQty: number;
  /** 预警阈值 */
  warnThreshold: number;
  health: SupplierStockHealth;
  updatedAt: string;
}

// ===== 供应商结算（应收）=====
export type SupplierSettlementStatus = 'PENDING' | 'CONFIRMED' | 'PAID';

export interface SupplierSettlement {
  id: string;
  settlementNo: string;
  supplierId: string;
  periodFrom: string;
  periodTo: string;
  orderCount: number;
  /** 应收金额（按成本价） */
  amount: number;
  status: SupplierSettlementStatus;
  generatedAt: string;
  confirmedAt?: string;
  paidAt?: string;
  remark?: string;
}

// ===== 企业资料 =====
export interface SupplierProfile {
  supplierId: string;
  supplierName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  province?: string;
  city?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  taxNo?: string;
  businessLicenseUrl?: string;
  description?: string;
  updatedAt: string;
}
