/**
 * Mock 工具
 */
export function paginate<T>(records: T[], pageNo: number, pageSize: number) {
  const start = (pageNo - 1) * pageSize;
  return {
    records: records.slice(start, start + pageSize),
    total: records.length,
  };
}

export function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export function randomId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const SUPPLIER_NAMES = ['顺丰食品', '大地农产', '北辰乳业', '蜀香调味', '云都饮料', '海岸海鲜', '青山菌菇', '雪原冷链'];
const STORE_NAMES = ['黄山景区一号店', '九寨沟入口店', '丽江古城店', '张家界中心店', '凤凰旗舰店', '泰山脚下店', '峨眉特产店', '婺源茶庄'];
const PRODUCT_NAMES = ['有机鸡蛋 30 枚', '雪域牦牛奶 1L', '川香花椒 500g', '云南普洱 357g', '深海鳕鱼 1kg', '野生菌菇礼盒', '高山苹果 5kg', '冷冻虾仁 500g'];
const CATEGORIES = ['生鲜', '乳制品', '调味品', '饮品', '海鲜', '菌菇', '水果', '冻品'];
const UNITS = ['箱', '瓶', '袋', '盒', '件'];
const PROVINCES = ['北京', '上海', '四川', '云南', '广东', '湖南', '浙江', '安徽'];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const MOCK_DATA = {
  SUPPLIER_NAMES,
  STORE_NAMES,
  PRODUCT_NAMES,
  CATEGORIES,
  UNITS,
  PROVINCES,
};
