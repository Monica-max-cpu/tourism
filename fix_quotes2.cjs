const fs = require('fs');
const path = require('path');

const base = __dirname;

const lines = [
  ['src/views/admin/CollectiveOrders.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/DeliveryManage.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/admin/StoreReview.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/admin/SupplierReview.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/store/MyPayments.vue', `title: '状态, width: 110`, `title: '状态', width: 110`],
  ['src/views/supplier/OrderActive.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/ProductLibrary.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/ShipmentManage.vue', `title: '状态, width: 90`, `title: '状态', width: 90`],
  ['src/views/supplier/QuoteHistory.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/QuoteManage.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
  ['src/views/supplier/OrderPending.vue', `title: '状态, width: 100`, `title: '状态', width: 100`],
];

let fixed = 0;
for (const [relPath, oldStr, newStr] of lines) {
  const fullPath = path.join(base, relPath);
  if (!fs.existsSync(fullPath)) { console.log(`SKIP ${relPath}`); continue; }
  let content = fs.readFileSync(fullPath, 'utf-8');
  if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`FIXED ${relPath}`);
    fixed++;
  } else {
    console.log(`NOT FOUND ${relPath}`);
  }
}
console.log(`\n${fixed} files fixed.`);
