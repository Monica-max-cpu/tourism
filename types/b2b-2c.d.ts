/**
 * 阶段 2C 业务类型
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段2C】集采/履约/结算/利润类型
 * 价格隔离：
 *  - 平台管理员：可见 销售价 + 成本价 + 毛利
 *  - 供应商：仅可见自己的成本价
 *  - 门店：仅可见销售价
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段2C】集采/履约/结算/利润类型
 */

// ===== 集采（管理员视角）=====
export type CollectiveStatus =
  | 'PENDING' // 待触发
  | 'TRIGGERED' // 已触发，待供应商确认
  | 'CONFIRMED' // 供应商确认
  | 'SHIPPING' // 供应商发货中
  | 'COMPLETED' // 已完成
  | 'CANCELLED'; // 已取消

export interface PendingCollectiveItem {
  /** 待集采项分组 ID（按 SKU 聚合） */
  id: string;
  productSku: string;
  productName: string;
  unit: string;
  /** 已聚合的门店订单数 */
  orderCount: number;
  /** 已聚合的总数量 */
  totalQty: number;
  /** 销售总额（按销售价） */
  saleAmount: number;
  /** 当前最优成本价 */
  bestCostPrice: number;
  /** 预估毛利 */
  estimatedProfit: number;
  /** 距上次触发时间（小时） */
  hoursSinceLast: number;
  /** 是否达到自动触发阈值 */
  reachedThreshold: boolean;
}

export interface CollectiveOrderItem {
  productSku: string;
  productName: string;
  unit: string;
  qty: number;
  /** 集采采购单价（成本价，给供应商） */
  costPrice: number;
  subtotal: number;
}

export interface CollectiveOrder {
  id: string;
  collectiveNo: string;
  /** 关联门店订单 ID 列表 */
  storeOrderIds: string[];
  storeOrderCount: number;
  supplierId: string;
  supplierName: string;
  status: CollectiveStatus;
  items: CollectiveOrderItem[];
  /** 总采购金额（按成本价） */
  purchaseAmount: number;
  /** 关联门店订单销售总额（按销售价） */
  saleAmount: number;
  /** 毛利 = saleAmount - purchaseAmount */
  profit: number;
  triggeredAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  remark?: string;
}

export interface CollectiveConfig {
  /** 单 SKU 累计订单达到该数量时自动触发 */
  qtyThreshold: number;
  /** 距上次触发的最大间隔（小时），超时强制触发 */
  hoursTimeout: number;
  /** 是否启用自动触发 */
  autoTrigger: boolean;
}

// ===== 履约 =====
export type DeliveryStatus = 0 | 1 | 2 | 3;

export interface DeliveryRecord {
  id: string;
  deliveryNo: string;
  collectiveOrderId: string;
  collectiveItemId: string;
  storeId: string;
  storeName?: string;
  supplierId: string;
  supplierName: string;
  productName?: string;
  warehouseId?: string;
  deliveryMode: number;
  deliveryQty: number;
  receivedQty?: number;
  logisticsCompany?: string;
  trackingNo?: string;
  status: DeliveryStatus;
  shippedTime?: string;
  receivedTime?: string;
  receiveRemark?: string;
  createTime?: string;
}

// ===== 结算 =====
export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'REFUNDED';
export type SettlementType = 'STORE' | 'SUPPLIER';

export interface SettlementRecord {
  id: string;
  settlementNo: string;
  type: SettlementType;
  /** 对手方（门店或供应商）名称 */
  partyName: string;
  partyId: string;
  /** 周期 */
  periodFrom: string;
  periodTo: string;
  /** 订单数 */
  orderCount: number;
  /** 应收/应付金额 */
  amount: number;
  status: SettlementStatus;
  generatedAt: string;
  confirmedAt?: string;
  paidAt?: string;
  remark?: string;
}

// ===== 利润 =====
export interface ProfitRecord {
  id: string;
  /** 关联集采单 */
  collectiveNo: string;
  productSku: string;
  productName: string;
  qty: number;
  unit: string;
  /** 销售价 */
  salePrice: number;
  /** 成本价 */
  costPrice: number;
  /** 毛利单价 */
  profitPerUnit: number;
  /** 销售总额 */
  saleAmount: number;
  /** 采购总额 */
  costAmount: number;
  /** 毛利 */
  profit: number;
  /** 毛利率 % */
  profitRate: number;
  /** 入账时间 */
  postedAt: string;
}
