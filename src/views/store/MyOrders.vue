<script setup lang="ts">
/**
 * 门店 - 我的采购订单
 * update-begin--author:claude---date:2026-05-27---for:【阶段7】订单列表样式对齐原型
 * - 新增统计卡片（全部、待支付、配送中、已完成、订单总额）
 * - Tabs 状态筛选替代下拉
 * - 表格列丰富：单号(monospace)、商品数、金额(primary)、状态Badge+图标
 * update-end--author:claude---date:2026-05-27---for:【阶段7】订单列表样式对齐原型
 */
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Package, Clock, Truck, CheckCircle, CreditCard } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label, Card, CardContent,
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { listStoreOrdersApi, cancelStoreOrderApi, confirmReceiveApi } from '/@/api/store/order';
import {
  STORE_ORDER_STATUS_LABEL, STORE_ORDER_STATUS_VARIANT,
} from '/@/constants/storeStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';
import type { StoreViewOrder } from '/#/b2b-store';

const router = useRouter();
const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const search = reactive({ orderNo: '' });
const activeTab = ref('all');
const [registerTable, { reload }] = useTable();

// ====== 统计卡片 ======
interface StatItem {
  key: string;
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bg: string;
}
const stats = ref<StatItem[]>([
  { key: 'all', label: '全部订单', value: 0, icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
  { key: '0', label: '待支付', value: 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: '3', label: '配送中', value: 0, icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: '5', label: '已完成', value: 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'amount', label: '订单总金额', value: '¥0', icon: CreditCard, color: 'text-primary', bg: 'bg-primary/5' },
]);

async function loadStats() {
  if (!storeId.value) return;
  try {
    // 拉全量数据用于统计（mock 下 paginate 返回 total 字段）
    const res: any = await listStoreOrdersApi({ pageNo: 1, pageSize: 1, storeId: storeId.value });
    const total = res?.total ?? (Array.isArray(res) ? res.length : 0);

    // 各状态数量
    const counts: Record<string, number> = {};
    for (const status of [0, 3, 5]) {
      const r: any = await listStoreOrdersApi({ pageNo: 1, pageSize: 1, storeId: storeId.value, orderStatus: status });
      counts[status] = r?.total ?? 0;
    }

    // 总金额（mock 直接算）
    const allRes: any = await listStoreOrdersApi({ pageNo: 1, pageSize: 1000, storeId: storeId.value });
    const records = allRes?.records ?? (Array.isArray(allRes) ? allRes : []);
    const totalAmount = records.reduce((s: number, x: any) => s + (x.totalAmount || 0), 0);

    stats.value = [
      { key: 'all', label: '全部订单', value: total, icon: Package, color: 'text-primary', bg: 'bg-primary/5' },
      { key: '0', label: '待支付', value: counts[0] || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
      { key: '3', label: '配送中', value: counts[3] || 0, icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
      { key: '5', label: '已完成', value: counts[5] || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { key: 'amount', label: '订单总金额', value: formatCurrency(totalAmount), icon: CreditCard, color: 'text-primary', bg: 'bg-primary/5' },
    ];
  } catch { /* stats load failure is non-blocking */ }
}
onMounted(loadStats);

// ====== 表格 ======
async function loadData(params: any) {
  const query: any = { ...params, storeId: storeId.value, orderNo: search.orderNo };
  if (activeTab.value !== 'all') {
    query.orderStatus = Number(activeTab.value);
  }
  return await listStoreOrdersApi(query);
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单编号', minWidth: 180, formatter: ({ cellValue }) => cellValue },
  { field: 'itemCount', title: '商品数', width: 90, align: 'center', formatter: ({ cellValue }) => cellValue != null ? `${cellValue} 件` : '-' },
  { field: 'totalAmount', title: '订单金额', width: 190, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', align: 'center', width: 190, slots: { default: 'status' } },
  { field: 'createTime', title: '下单时间', width: 220, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
];

function viewDetail(row: StoreViewOrder) { router.push(ROUTE_PATHS.STORE_ORDER_DETAIL.replace(':id', row.id)); }
function payNow(row: StoreViewOrder) { router.push(ROUTE_PATHS.STORE_ORDER_DETAIL.replace(':id', row.id)); }

// ====== 取消 ======
const cancelModal = useModal<StoreViewOrder>();
const cancelReason = ref('');
const cancelSubmitting = ref(false);
function cancelOrder(row: StoreViewOrder) { cancelReason.value = ''; cancelModal.open(row); }
async function confirmCancel() {
  const target = cancelModal.data.value;
  if (!target) return;
  cancelSubmitting.value = true;
  try {
    await cancelStoreOrderApi(target.id, cancelReason.value || '门店主动取消');
    cancelModal.close();
    reload();
    loadStats();
  } finally {
    cancelSubmitting.value = false;
  }
}
async function confirmReceive(row: StoreViewOrder) {
  await confirmReceiveApi(row.id);
  reload();
  loadStats();
}

function onTabChange(v: string) { activeTab.value = v; reload({ pageNo: 1 }); }
function onSearch() { reload({ pageNo: 1 }); }
function onReset() { search.orderNo = ''; reload({ pageNo: 1 }); }
</script>

<template>
  <PageWrapper title="我的采购订单" subtitle="仅展示当前门店的订单，按下单时间倒序">
    <template #extra>
      <Button @click="loadStats" variant="outline" size="sm" class="text-xs">刷新统计</Button>
    </template>

    <!-- 统计卡片 -->
    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      <Card
        v-for="s in stats" :key="s.key"
        :class="['overflow-hidden border-l-4 transition-shadow hover:shadow-md',
          s.key === 'all' ? 'border-l-primary' :
          s.key === '0' ? 'border-l-amber-500' :
          s.key === '3' ? 'border-l-indigo-500' :
          s.key === '5' ? 'border-l-emerald-500' :
          'border-l-primary']"
      >
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-muted-foreground">{{ s.label }}</p>
              <p class="text-2xl font-bold mt-1 tabular-nums">{{ s.value }}</p>
            </div>
            <div :class="['p-3 rounded-xl', s.bg, s.color]">
              <component :is="s.icon" class="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 订单列表 -->
    <Card>
      <CardContent class="p-0">
        <Tabs :model-value="activeTab" @update:model-value="onTabChange" class="w-full">
          <div class="border-b px-5 pt-4">
            <TabsList class="h-10 bg-transparent border-b-0 p-0 w-full justify-start gap-1">
              <TabsTrigger
                v-for="tab in [
                  { key: 'all', label: '全部' },
                  { key: '0', label: '待支付' },
                  { key: '1', label: '待集采' },
                  { key: '3', label: '配送中' },
                  { key: '5', label: '已完成' },
                  { key: '6', label: '已取消' },
                ]"
                :key="tab.key"
                :value="tab.key"
                class="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg px-4 h-9 text-sm"
              >
                {{ tab.label }}
              </TabsTrigger>
            </TabsList>
          </div>

          <!-- 搜索栏 -->
          <div class="px-5 py-3 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="relative flex-1 max-w-xs">
                <Input v-model="search.orderNo" placeholder="搜索订单号..." class="w-56" @keyup.enter="onSearch" />
              </div>
              <Button variant="outline" size="sm" @click="onSearch">搜索</Button>
              <Button variant="ghost" size="sm" @click="onReset">重置</Button>
            </div>
          </div>

          <!-- 表格 -->
          <TabsContent :value="activeTab" class="m-0 px-5 pb-4">
            <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
              <template #status="{ row }">
                <Badge :variant="STORE_ORDER_STATUS_VARIANT[row.orderStatus] || 'info'" class="gap-1">
                  {{ row.statusLabel || STORE_ORDER_STATUS_LABEL[row.orderStatus] }}
                </Badge>
              </template>
              <template #action="{ row }">
                <TableAction
                  :actions="[
                    { label: '查看', onClick: () => viewDetail(row) },
                    { label: '去支付', authCode: 'b2b:store:payment', hidden: row.orderStatus !== 0, onClick: () => payNow(row) },
                    { label: '取消订单', variant: 'destructive', hidden: row.orderStatus !== 0, onClick: () => cancelOrder(row) },
                    { label: '确认收货', authCode: 'b2b:store:receive', hidden: row.orderStatus !== 3, onClick: () => confirmReceive(row) },
                  ]"
                />
              </template>
            </BasicTable>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <!-- 取消弹窗 -->
    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="确认取消订单"
      description="取消后不可恢复，请填写取消原因"
      confirm-text="确认取消"
      :confirm-loading="cancelSubmitting"
      @confirm="confirmCancel"
    >
      <div class="space-y-2">
        <Label>取消原因</Label>
        <Input v-model="cancelReason" placeholder="请输入取消原因" />
      </div>
    </BasicModal>
  </PageWrapper>
</template>
