const fs = require('fs');
const path = require('path');

const base = __dirname;

const fixes = [
  // Pattern C: title: '状态, width: → title: '状态', width:
  ['src/views/admin/CatalogManage.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/admin/CollectiveOrders.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/admin/DeliveryManage.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/admin/PaymentManage.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/QuoteReview.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/SettlementStores.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/SettlementSuppliers.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/StockManage.vue', `title: '状态, width: 90`, `title: '状态', width: 90`],
  ['src/views/admin/StoreOrderManage.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/StoreReview.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/SupplierReview.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/store/MyOrders.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/store/MyPayments.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/MySettlement.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/OrderActive.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],

  // Pattern B: title="... missing closing quote
  ['src/views/supplier/MyInventory.vue', `title="调整预警阈值`, `title="调整预警阈值"`],
  ['src/views/admin/DeliveryManage.vue', `title="处理配送异常`, `title="处理配送异常"`],

  // Pattern A: subtitle="... missing closing quote
  ['src/views/admin/QuoteReview.vue', `subtitle="审核供应商提交的商品报价（仅管理员可见成本价）`, `subtitle="审核供应商提交的商品报价（仅管理员可见成本价）"`],
];

let fixed = 0;
for (const [relPath, oldStr, newStr] of fixes) {
  const fullPath = path.join(base, relPath);
  if (!fs.existsSync(fullPath)) { console.log(`SKIP ${relPath}`); continue; }
  let content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`FIXED ${relPath}`);
    fixed++;
  } else {
    console.log(`OK    ${relPath} (pattern not found)`);
  }
}
console.log(`\n${fixed} files fixed.`);
