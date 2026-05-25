const fs = require('fs');
const path = require('path');

const base = __dirname;

const replacements = {
  'src/views/store/Cart.vue': [
    ['购物�? * update-begin', '购物车\n * update-begin'],
    ['持久�? * - 勾�?', '持久化\n * - 勾选'],
    ['待支付�? * update-end', '待支付）\n * update-end'],
    ['购物�?/Badge>', '购物车</Badge>'],
    ['空空如�?      <div', '空空如也\n      <div'],
    ['全�?/span>', '全选</span>'],
    ['已�?{{ cartStore.getSelectedItems.length }} �?/span>', '已选 {{ cartStore.getSelectedItems.length }} 件</span>'],
    ['结算�?-->', '结算栏 -->'],
    ['已�?{{ cartStore.getSelectedItems.length }} �?/div>', '已选 {{ cartStore.getSelectedItems.length }} 件</div>'],
    ['带出�?const receive', '带出）\nconst receive'],
    ['已下单商�?    cartStore.removeBatch', '已下单商品\n    cartStore.removeBatch'],
  ],
  'src/views/store/OrderDetail.vue': [
    ['支付提交�? * update-begin', '支付提交）\n * update-begin'],
    ['订单详�?+ 支付凭证', '订单详情 + 支付凭证'],
    ['订�?PENDING_PAYMENT �?PENDING_CONFIRM', '订单 PENDING_PAYMENT → PENDING_CONFIRM'],
    ['成本�?/ 供应�? * update-end', '成本价 / 供应商\n * update-end'],
    ['阶�?7', '阶段 7'],
    ['时间�?const timeline', '时间线\nconst timeline'],
    ['配�?, time: o.shippedAt', "配送', time: o.shippedAt"],
    ['加载�?..</div>', '加载中...</div>'],
    ['无访问权�?/div>', '无访问权限</div>'],
    ['收货 / 时间�?-->', '收货 / 时间线 -->'],
    ['时间�?-->', '时间线 -->'],
    ["t.done ? '�? : '·'", "t.done ? '✓' : '·'"],
    ['支付�?/TabsTrigger>', '支付宝</TabsTrigger>'],
    ['凭证�名URL', '凭证图片 URL'],
    ['付款人�? />', '付款人" />'],
    ['流水号�?          </div>', '流水号。\n          </div>'],
  ],
  'src/views/store/Procurement.vue': [
    ['采购目�? * - 仅展�?salePrice', '采购目录\n * - 仅展示 salePrice'],
    ['瀑布�?+ 加入购物�? * update-end', '瀑布流 + 加入购物车\n * update-end'],
    ['销售价�?>', '销售价）\n'],
    ['加载�?..</div>', '加载中...</div>'],
    ['起订�?{{ it.minQty }}', '起订量 {{ it.minQty }}'],
    ['上一�?/Button>', '上一页</Button>'],
    ['下一�?/Button>', '下一页</Button>'],
  ],
  'src/views/store/MyOrders.vue': [
    ['门店订单列�? * - 仅展示自有订单', '门店订单列表\n * - 仅展示自有订单'],
    ['强制过滤�? * - 价格列只展示销售价合计', '强制过滤）\n * - 价格列只展示销售价合计'],
    ['成本/供应�?毛利', '成本/供应商毛利'],
    ["SKU �?, width: 80", "SKU 数', width: 80"],
    ['承运�?, width: 110', "承运方', width: 110"],
    ['运单�?, width: 160', "运单号', width: 160"],
    ['去支�?, authCode', "去支付', authCode"],
  ],
  'src/views/store/MyPayments.vue': [
    ['门店付款记�? * - 仅展示当前门店付款', '门店付款记录\n * - 仅展示当前门店付款'],
    ['强制过滤�? * - 支持查看凭证', '强制过滤）\n * - 支持查看凭证'],
    ['订单�名 class=', '订单号" class='],
    ['流水�?/span>', '流水号：</span>'],
    ['凭证�?/div>', '凭证图</div>'],
  ],
  'src/views/store/SalesReport.vue': [
    ['销售上�? * update-begin', '销售上报\n * update-begin'],
    ['不出�?cost/profit', '不出现 cost/profit'],
    ['�?storeId 强制过滤', '按 storeId 强制过滤'],
    ['销�?, width: 100', "销量', width: 100"],
    ['汇�?const summary', '汇总\nconst summary'],
    ["unit: '�?,", "unit: '个',"],
  ],
  'src/views/store/Profile.vue': [
    ['门店资�? * - 加载 / 编辑 / 保存', '门店资料\n * - 加载 / 编辑 / 保存'],
    ['带出�? * update-end', '带出）\n * update-end'],
    ['保存�?..', '保存中...'],
    ['加载�?..</div>', '加载中...</div>'],
    ['xx �?xx �?xx �? />', 'xx 省 xx 市 xx 区" />'],
  ],
  // Supplier views
  'src/views/supplier/MyInventory.vue': [
    ['供应�?- 我的库存', '供应商 - 我的库存'],
    ['自动占�?>', '自动占用\n'],
    ["unit || '-' }}�?</Label>", "unit || '-' }}）</Label>"],
    ['调整预警阈�?', '调整预警阈值'],
    ['改阈�?, authCode', "改阈值', authCode"],
    ['预警阈�?, width: 100', "预警阈值', width: 100"],
    ['健康�?, width: 90', "健康度', width: 90"],
    ['productName}�?{productSku}', 'productName}（${productSku}'],
  ],
  'src/views/supplier/MySettlement.vue': [
    ['供应�?- 我的结算', '供应商 - 我的结算'],
    ['等待付�?>', '等待付款\n'],
    ['待确认应�?/div>', '待确认应收</div>'],
    ['累计已到�?/div>', '累计已到账</div>'],
    ["周期�?, width: 110, formatter: ({ cellValue }) => formatDate(cellValue) }", "周期起', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) }"],
    ["订单�?, width: 80", "订单数', width: 80"],
  ],
  'src/views/supplier/ProductLibrary.vue': [
    ['供应�?- 自营商品库', '供应商 - 自营商品库'],
    ['创建报�?>', '创建报价\n'],
    ["默认成本�?, width: 120", "默认成本价', width: 120"],
  ],
  'src/views/supplier/ShipmentManage.vue': [
    ['供应�?- 发货管理', '供应商 - 发货管理'],
    ["关联集采�?, width: 150", "关联集采单', width: 150"],
    ["总数�?, width: 90", "总数量', width: 90"],
    ['承运�?, width: 110', "承运方', width: 110"],
    ['运单�?, width: 160', "运单号', width: 160"],
    ['运单�名 class=', '运单号" class='],
  ],
  'src/views/supplier/Profile.vue': [
    ['供应�?- 企业资料维护', '供应商 - 企业资料维护'],
    ['保存�?..', '保存中...'],
    ['收款与资�?/CardTitle>', '收款与资质</CardTitle>'],
    ['阶�?4 接入文件上传组件', '阶段 4 接入文件上传组件'],
  ],
  'src/views/supplier/OrderPending.vue': [
    ['供应�?- 待确认集采单', '供应商 - 待确认集采单'],
    ['确认或拒�?>', '确认或拒绝\n'],
    ["汇总门店订�?, width: 120", "汇总门店订单', width: 120"],
    ["SKU �?, width: 80", "SKU 数', width: 80"],
    ['�名CO20260500', '例如 CO20260500'],
    ['集采单明�?', '集采单明细'],
    ['应收金额�?/span>', '应收金额：</span>'],
    ['下达时间�?/span>', '下达时间：</span>'],
    ['备注�?/span>', '备注：</span>'],
    ['拒绝集采�?', '拒绝集采单'],
  ],
  'src/views/supplier/OrderActive.vue': [
    ['供应�?- 进行中集采单', '供应商 - 进行中集采单'],
    ["汇总门店订�?, width: 120", "汇总门店订单', width: 120"],
    ['承运�?, width: 110', "承运方', width: 110"],
    ['运单�?, width: 160', "运单号', width: 160"],
    ['�名CO20260500', '例如 CO20260500'],
    ['集采单明�?', '集采单明细'],
    ['应收金额�?/span>', '应收金额：</span>'],
  ],
  'src/views/supplier/QuoteManage.vue': [
    ['供应�?- 报价管理', '供应商 - 报价管理'],
    ['平台审核�?>', '平台审核）\n'],
    ["起订�?, width: 80", "起订量', width: 80"],
    ["单位' }}�?<span", "单位' }}）<span"],
  ],
  'src/views/supplier/QuoteHistory.vue': [
    ['供应�?- 报价历史', '供应商 - 报价历史'],
  ],
  // Admin views
  'src/views/admin/CatalogManage.vue': [
    ['平台管理�?- 平台商品目录', '平台管理员 - 平台商品目录'],
    ['可�名 />', '可选" />'],
  ],
  'src/views/admin/PaymentManage.vue': [
    ['平台管理�?- 待确认收�? */', '平台管理员 - 待确认收款 */'],
    ["关联订单�?, width: 160", "关联订单号', width: 160"],
    ['支付记�?>', '支付记录\n'],
    ['支付�?/SelectItem>', '支付宝</SelectItem>'],
    ['支付编号�?/span>', '支付编号：</span>'],
    ['关联订单�?/span>', '关联订单号：</span>'],
    ['门店�?/span>', '门店：</span>'],
    ['金额�?/span>', '金额：</span>'],
    ['支付方式�?/span>', '支付方式：</span>'],
    ['提交时间�?/span>', '提交时间：</span>'],
    ['确认时间�?/span>', '确认时间：</span>'],
    ['驳回原因�?/span>', '驳回原因：</span>'],
  ],
  'src/views/admin/StockManage.vue': [
    ['平台管理�?- 库存管理', '平台管理员 - 库存管理'],
    ["归属�?, minWidth: 180", "归属方', minWidth: 180"],
    ['预警阈�?, width: 100', "预警阈值', width: 100"],
    ['归属�名 class=', '归属方" class='],
    ['编辑预警阈�?', '编辑预警阈值'],
  ],
  'src/views/admin/CollectiveOrders.vue': [
    ['平台管理�?- 集采单列�? */', '平台管理员 - 集采单列表 */'],
    ["供应�?, minWidth: 200", "供应商', minWidth: 200"],
    ["销售金�?, width: 130", "销售金额', width: 130"],
    ['集采订�?>', '集采订单\n'],
    ['供应�名 class=', '供应商" class='],
    ['集采单详�? width=', '集采单详情" width='],
    ['集采单号�?/span>', '集采单号：</span>'],
    ['触发时间�?/span>', '触发时间：</span>'],
    ['完成时间�?/span>', '完成时间：</span>'],
    ['成本价�?/h4>', '成本价）</h4>'],
    ['成本�?/th>', '成本价</th>'],
    ['销售金�?/div>', '销售金额</div>'],
    ['门店订单�?/span>{{ detailModal.data.value.storeOrderCount }} �?/div>', '门店订单：</span>{{ detailModal.data.value.storeOrderCount }} 笔</div>'],
  ],
  'src/views/admin/DeliveryManage.vue': [
    ['平台管理�?- 履约管理', '平台管理员 - 履约管理'],
    ["配送单�?, width: 160", "配送单号', width: 160"],
    ["供应�?, minWidth: 180", "供应商', minWidth: 180"],
    ['承运�?, width: 110', "承运方', width: 110"],
    ['配送跟�?>', '配送跟踪\n'],
    ['供应�名 class=', '供应商" class='],
    ['配送异�?', '配送异常'],
    ['重新派�?/SelectItem>', '重新派单</SelectItem>'],
    ['取消配�?/SelectItem>', '取消配送</SelectItem>'],
    ['处理说�? />', '处理说明" />'],
  ],
  'src/views/admin/QuoteReview.vue': [
    ['平台管理�?- 供应商报价审�? */', '平台管理员 - 供应商报价审核 */'],
    ["供应�?, minWidth: 200", "供应商', minWidth: 200"],
    ["报价（成本价�?, width: 130", "报价（成本价）', width: 130"],
    ['成本价�?>', '成本价）\n'],
    ['供应�名/ 编号', '供应商名 / 编号'],
    ['驳回原�名 />', '驳回原因" />'],
  ],
  'src/views/admin/ProfitRecords.vue': [
    ['平台管理�?- 利润记录', '平台管理员 - 利润记录'],
    ["成本�?, width: 110", "成本价', width: 110"],
    ["采购�?, width: 130", "采购额', width: 130"],
    ["毛利�?, width: 90", "毛利率', width: 90"],
    ['综合毛利�?/div>', '综合毛利率</div>'],
  ],
  'src/views/admin/SettlementStores.vue': [
    ['平台管理�?- 门店结算（应收）', '平台管理员 - 门店结算（应收）'],
    ["订单�?, width: 90", "订单数', width: 90"],
    ['结算�?>', '结算单\n'],
  ],
  'src/views/admin/SettlementSuppliers.vue': [
    ['平台管理�?- 供应商结算（应付�? */', '平台管理员 - 供应商结算（应付） */'],
    ["供应�?, minWidth: 200", "供应商', minWidth: 200"],
    ['供应�名 class=', '供应商" class='],
  ],
  'src/views/admin/StoreOrderManage.vue': [
    ['平台管理�?- 门店采购订单', '平台管理员 - 门店采购订单'],
    ["订单�?, width: 160", "订单号', width: 160"],
    ['订单�名/ 门店名称', '订单号 / 门店名称'],
    ['门店�?/span>', '门店：</span>'],
    ['下单�?/span>', '下单人：</span>'],
    ['支付�?/span>', '支付人：</span>'],
    ['取消订�?${cancelModal', '取消订单 ${cancelModal'],
    ['取消原�? />', '取消原因" />'],
  ],
  'src/views/admin/StoreReview.vue': [
    ['平台管理�?- 门店入驻审核', '平台管理员 - 门店入驻审核'],
    ["负责�?, width: 100", "负责人', width: 100"],
    ['入驻申�?>', '入驻申请\n'],
    ['申请编号�?/span>', '申请编号：</span>'],
    ['门店名称�?/span>', '门店名称：</span>'],
    ['门店类型�?/span>', '门店类型：</span>'],
    ['电话�?/span>', '电话：</span>'],
    ['邮箱�?/span>', '邮箱：</span>'],
    ['所在地�?/span>', '所在地：</span>'],
    ['提交时间�?/span>', '提交时间：</span>'],
    ['详细地址�?/span>', '详细地址：</span>'],
    ['驳回原因�?/span>', '驳回原因：</span>'],
    ['将驳�?${rejectModal', '将驳回 ${rejectModal'],
    ['驳回原�? />', '驳回原因" />'],
  ],
  'src/views/admin/SupplierReview.vue': [
    ['平台管理�?- 供应商入驻审�? */', '平台管理员 - 供应商入驻审核 */'],
    ["供应商名�?, minWidth: 220", "供应商名称', minWidth: 220"],
    ["联系�?, width: 100", "联系人', width: 100"],
    ['供应�名/ 编号 / 电话', '供应商名 / 编号 / 电话'],
    ['入驻详�?', '入驻详情'],
    ['申请编号�?/span>', '申请编号：</span>'],
    ['联系电话�?/span>', '联系电话：</span>'],
    ['联系邮箱�?/span>', '联系邮箱：</span>'],
    ['所在地�?/span>', '所在地：</span>'],
    ['提交时间�?/span>', '提交时间：</span>'],
    ['详细地址�?/span>', '详细地址：</span>'],
    ['备注�?/span>', '备注：</span>'],
    ['驳回原因�?/span>', '驳回原因：</span>'],
    ['将驳�?${rejectModal', '将驳回 ${rejectModal'],
  ],
};

let totalFixed = 0;

for (const [relPath, pairs] of Object.entries(replacements)) {
  const fullPath = path.join(base, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP ${relPath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let changed = false;

  for (const [oldStr, newStr] of pairs) {
    if (content.includes(oldStr)) {
      content = content.replaceAll(oldStr, newStr);
      changed = true;
      totalFixed++;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`FIXED ${relPath}`);
  } else {
    console.log(`OK    ${relPath}`);
  }
}

// Check for remaining corruption
console.log(`\nTotal replacements: ${totalFixed}`);

let remaining = 0;
const viewDir = path.join(base, 'src', 'views');
function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(p);
    } else if (entry.name.endsWith('.vue')) {
      const content = fs.readFileSync(p, 'utf-8');
      const count = (content.match(/�/g) || []).length;
      if (count > 0) {
        console.log(`REMAINING: ${path.relative(base, p)} - ${count} corrupted chars`);
        remaining += count;
      }
    }
  }
}
scanDir(viewDir);
console.log(`\nRemaining corrupted chars: ${remaining}`);
