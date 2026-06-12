<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CheckCircle, Clock, CreditCard, Package } from 'lucide-vue-next';
import {
  Badge, Button, Card, CardContent, Input, Label,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { TableAction } from '/@/components/TableAction';
import { listStoreOrdersApi, cancelStoreOrderApi } from '/@/api/store/order';
import { STORE_ORDER_STATUS_LABEL, STORE_ORDER_STATUS_VARIANT } from '/@/constants/storeStatus';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { formatCurrency, formatDateTime } from '/@/utils/format';
import type { StoreViewOrder } from '/#/b2b-store';

const router = useRouter();

const search = reactive({ orderNo: '' });
const activeTab = ref('all');
const refreshing = ref(false);
const [registerTable, { reload }] = useTable();

interface StatItem {
  key: string;
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bg: string;
  borderColor: string;
  accentShadow: string;
}

const stats = ref<StatItem[]>([
  { key: 'all', label: '全部订单', value: 0, icon: Package, color: 'text-primary', bg: 'bg-primary/5', borderColor: 'hsl(var(--primary))', accentShadow: 'inset 1px 0 0 rgb(33 79 182 / 0.18)' },
  { key: '0', label: '待支付', value: 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', borderColor: '#f59e0b', accentShadow: 'inset 1px 0 0 rgb(245 158 11 / 0.18)' },
  { key: '5', label: '已完成', value: 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', borderColor: '#10b981', accentShadow: 'inset 1px 0 0 rgb(16 185 129 / 0.18)' },
  { key: 'amount', label: '订单总金额', value: formatCurrency(0), icon: CreditCard, color: 'text-primary', bg: 'bg-primary/5', borderColor: 'hsl(var(--primary))', accentShadow: 'inset 1px 0 0 rgb(33 79 182 / 0.18)' },
]);

async function loadStats() {
  const page = await listStoreOrdersApi({ pageNo: 1, pageSize: 1000 });
  const records = page.records || [];
  const total = Number(page.total ?? records.length);
  const countByStatus = (status: number) => records.filter((row) => row.orderStatus === status).length;
  const totalAmount = records.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0);

  stats.value = [
    { key: 'all', label: '全部订单', value: total, icon: Package, color: 'text-primary', bg: 'bg-primary/5', borderColor: 'hsl(var(--primary))', accentShadow: 'inset 1px 0 0 rgb(33 79 182 / 0.18)' },
    { key: '0', label: '待支付', value: countByStatus(0), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', borderColor: '#f59e0b', accentShadow: 'inset 1px 0 0 rgb(245 158 11 / 0.18)' },
    { key: '5', label: '已完成', value: countByStatus(5), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', borderColor: '#10b981', accentShadow: 'inset 1px 0 0 rgb(16 185 129 / 0.18)' },
    { key: 'amount', label: '订单总金额', value: formatCurrency(totalAmount), icon: CreditCard, color: 'text-primary', bg: 'bg-primary/5', borderColor: 'hsl(var(--primary))', accentShadow: 'inset 1px 0 0 rgb(33 79 182 / 0.18)' },
  ];
}

async function refreshAll() {
  refreshing.value = true;
  try {
    await Promise.all([
      loadStats(),
      reload({ pageNo: 1 }),
    ]);
  } finally {
    refreshing.value = false;
  }
}

onMounted(async () => {
  await Promise.all([
    loadStats(),
    reload({ pageNo: 1 }),
  ]);
});

async function loadData(params: any) {
  const query = { ...params };
  if (search.orderNo) query.orderNo = search.orderNo;
  if (activeTab.value !== 'all') query.orderStatus = Number(activeTab.value);
  return await listStoreOrdersApi(query);
}

const columns: BasicColumn[] = [
  { field: 'orderNo', title: '订单编号', width: 200 },
  { field: 'totalAmount', title: '订单金额', width: 180, align: 'center', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'orderStatus', title: '状态', align: 'center', width: 290, slots: { default: 'status' } },
  { field: 'createTime', title: '下单时间',align: 'center', width: 350, formatter: ({ cellValue }) => formatDateTime(cellValue) },
  { field: 'action', title: '操作', width: 280, fixed: 'right', slots: { default: 'action' } },
];

function orderDetailLocation(row: StoreViewOrder) {
  return {
    path: ROUTE_PATHS.STORE_ORDER_DETAIL.replace(':id', row.id),
    query: row.createTime ? { createTime: row.createTime } : undefined,
  };
}

function viewDetail(row: StoreViewOrder) {
  router.push(orderDetailLocation(row));
}

function payNow(row: StoreViewOrder) {
  router.push(orderDetailLocation(row));
}

const cancelModal = useModal<StoreViewOrder>();
const cancelReason = ref('');
const cancelSubmitting = ref(false);

function cancelOrder(row: StoreViewOrder) {
  cancelReason.value = '';
  cancelModal.open(row);
}

async function confirmCancel() {
  const target = cancelModal.data.value;
  if (!target) return;
  cancelSubmitting.value = true;
  try {
    await cancelStoreOrderApi(target.id, cancelReason.value || '门店主动取消');
    cancelModal.close();
    await refreshAll();
  } finally {
    cancelSubmitting.value = false;
  }
}

function onTabChange(v: string) {
  activeTab.value = v;
  reload({ pageNo: 1 });
}

function onSearch() {
  reload({ pageNo: 1 });
}

function onReset() {
  search.orderNo = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="我的采购订单" subtitle="仅展示当前门店的订单，按下单时间倒序">
    <template #extra>
      <Button variant="outline" size="sm" :disabled="refreshing" @click="refreshAll">
        {{ refreshing ? '刷新中...' : '刷新统计' }}
      </Button>
    </template>

    <section class="mb-6 grid grid-cols-2 gap-6 xl:grid-cols-4">
      <Card
        v-for="s in stats"
        :key="s.key"
        class="overflow-hidden transition-shadow hover:shadow-md"
        :style="{ borderLeftWidth: '6px', borderLeftStyle: 'solid', borderLeftColor: s.borderColor, boxShadow: s.accentShadow }"
      >
        <CardContent class="p-5 md:p-6">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs text-muted-foreground">{{ s.label }}</p>
              <p class="text-2xl font-bold mt-1 tabular-nums truncate">{{ s.value }}</p>
            </div>
            <div :class="['p-3 rounded-lg shrink-0', s.bg, s.color]">
              <component :is="s.icon" class="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <Card>
      <CardContent class="p-0">
        <Tabs :model-value="activeTab" @update:model-value="(v: any) => onTabChange(String(v))" class="w-full">
          <div class="border-b px-5 pt-4">
            <TabsList class="h-10 bg-transparent border-b-0 p-0 w-full justify-start gap-1">
              <TabsTrigger
                v-for="tab in [
                  { key: 'all', label: '全部' },
                  { key: '0', label: '待支付' },
                  { key: '1', label: '待集采' },
                  { key: '2', label: '集采中' },
                  { key: '3', label: '发货中' },
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

          <div class="px-5 py-3 border-b border-border">
            <div class="flex items-center gap-3">
              <Label class="text-xs text-muted-foreground">订单号</Label>
              <Input v-model="search.orderNo" placeholder="搜索订单号" class="w-56" @keyup.enter="onSearch" />
              <Button variant="outline" size="sm" @click="onSearch">搜索</Button>
              <Button variant="ghost" size="sm" @click="onReset">重置</Button>
            </div>
          </div>

          <TabsContent :value="activeTab" class="m-0 px-5 pb-4">
            <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
              <template #status="{ row }">
                <Badge :variant="STORE_ORDER_STATUS_VARIANT[row.orderStatus] || 'info'">
                  {{ row.statusLabel || STORE_ORDER_STATUS_LABEL[row.orderStatus] }}
                </Badge>
              </template>
              <template #action="{ row }">
                <TableAction
                  :actions="[
                    { label: '查看', onClick: () => viewDetail(row) },
                    { label: '去支付', authCode: 'b2b:store:payment', hidden: row.orderStatus !== 0, onClick: () => payNow(row) },
                    { label: '取消订单',  hidden: row.orderStatus !== 0, onClick: () => cancelOrder(row) },
                  ]"
                />
              </template>
            </BasicTable>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <BasicModal
      v-model:open="cancelModal.visible.value"
      title="确认取消订单"
      description="取消后不可恢复，请填写取消原因"
      confirm-text="确认取消"
      confirm-variant="destructive"
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
