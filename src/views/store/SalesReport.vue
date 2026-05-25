<script setup lang="ts">
/**
 * 门店 - 销售上报
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】销售上 * - 仅展示销售价（amount = 门店实际成交金额），不出现 cost/profit
 * - 按 storeId 强制过滤
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】销售上 */
import { reactive, ref, computed, onMounted } from 'vue';
import { Plus, TrendingUp, ShoppingBag, CalendarDays } from 'lucide-vue-next';
import {
  Badge, Button, Input, Label, Card, CardContent,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { SearchBar } from '/@/components/SearchBar';
import {
  listSalesReportsApi, createSalesReportApi, getSalesSummaryApi,
} from '/@/api/store/sales';
import { formatCurrency, formatDate, formatNumber } from '/@/utils/format';
import { useUserStore } from '/@/stores/modules/user';

const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const search = reactive({ keyword: '', reportDateFrom: '', reportDateTo: '' });
const [registerTable, { reload }] = useTable();

async function loadData(params: any) {
  return await listSalesReportsApi({ ...params, searchInfo: { ...search, storeId: storeId.value } });
}

const columns: BasicColumn[] = [
  { field: 'reportNo', title: '上报编号', width: 150 },
  { field: 'reportDate', title: '上报日期', width: 110, formatter: ({ cellValue }) => formatDate(cellValue) },
  { field: 'productName', title: '商品', minWidth: 180 },
  { field: 'productSku', title: 'SKU', width: 120 },
  { field: 'unit', title: '单位', width: 70 },
  { field: 'qty', title: '销量', width: 100, align: 'right', formatter: ({ cellValue }) => formatNumber(cellValue) },
  { field: 'amount', title: '销售额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'remark', title: '备注', minWidth: 150 },
];

// 汇总
const summary = ref<{ totalQty: number; totalAmount: number; days: number; last7d: { date: string; amount: number }[] }>({
  totalQty: 0, totalAmount: 0, days: 0, last7d: [],
});
async function loadSummary() {
  if (!storeId.value) return;
  summary.value = await getSalesSummaryApi(storeId.value);
}
onMounted(loadSummary);

const last7Max = computed(() => Math.max(1, ...summary.value.last7d.map((x) => x.amount)));

// 新建
const createModal = useModal();
const submitting = ref(false);
const form = reactive({
  productSku: '', productName: '', unit: '个',
  qty: 1, amount: 0,
  reportDate: new Date().toISOString().slice(0, 10),
  remark: '',
});
const formValid = computed(() => !!form.productSku && !!form.productName && form.qty > 0 && form.amount > 0 && !!form.reportDate);

function openCreate() {
  Object.assign(form, {
    productSku: '', productName: '', unit: '个',
    qty: 1, amount: 0,
    reportDate: new Date().toISOString().slice(0, 10),
    remark: '',
  });
  createModal.open();
}

async function confirmCreate() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    await createSalesReportApi({ ...form });
    createModal.close();
    reload();
    loadSummary();
  } finally {
    submitting.value = false;
  }
}

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = ''; search.reportDateFrom = ''; search.reportDateTo = '';
  reload({ pageNo: 1 });
}
</script>

<template>
  <PageWrapper title="销售上报" subtitle="按日上报门店实际销量与销售额">
    <template #extra>
      <Badge variant="secondary">门店端</Badge>
      <Button @click="openCreate"><Plus class="w-4 h-4 mr-1.5" />新增上报</Button>
    </template>

    <!-- 汇总卡 -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <ShoppingBag class="w-4 h-4 text-blue-600" />
            <div class="text-xs text-muted-foreground">累计销量</div>
          </div>
          <div class="text-2xl font-bold tabular-nums">{{ formatNumber(summary.totalQty) }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <TrendingUp class="w-4 h-4 text-emerald-600" />
            <div class="text-xs text-muted-foreground">累计销售额</div>
          </div>
          <div class="text-2xl font-bold text-primary tabular-nums">{{ formatCurrency(summary.totalAmount) }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <CalendarDays class="w-4 h-4 text-amber-600" />
            <div class="text-xs text-muted-foreground">上报天数</div>
          </div>
          <div class="text-2xl font-bold tabular-nums">{{ summary.days }}</div>
        </CardContent>
      </Card>
    </section>

    <!-- 7 日柱图（轻量 div 实现，正ECharts 见阶5-->
    <Card class="mb-4" v-if="summary.last7d.length">
      <CardContent class="p-5">
        <div class="text-sm font-medium mb-3">7 日销售额</div>
        <div class="flex items-end gap-3 h-32">
          <div v-for="d in summary.last7d" :key="d.date" class="flex-1 flex flex-col items-center gap-1">
            <div class="text-xs tabular-nums text-muted-foreground">{{ formatCurrency(d.amount) }}</div>
            <div class="w-full bg-primary/20 rounded-t" :style="{ height: `${Math.max(4, (d.amount / last7Max) * 100)}%` }"></div>
            <div class="text-[10px] text-muted-foreground tabular-nums">{{ d.date.slice(5) }}</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="商品 / SKU / 编号" class="w-52" @keyup.enter="onSearch" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">起始日期</Label>
        <Input v-model="search.reportDateFrom" type="date" class="w-40" />
      </div>
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">截止日期</Label>
        <Input v-model="search.reportDateTo" type="date" class="w-40" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable" />

    <BasicModal
      v-model:open="createModal.visible.value"
      title="新增销售上报"
      description="按日上报门店实际成交，平台用于结算与销售分析"
      :confirm-loading="submitting"
      :confirm-disabled="!formValid"
      width="540px"
      @confirm="confirmCreate"
    >
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1.5 col-span-2">
          <Label>商品名称 <span class="text-destructive">*</span></Label>
          <Input v-model="form.productName" placeholder="请输入商品名称" />
        </div>
        <div class="flex items-center gap-2">
          <Label>SKU <span class="text-destructive">*</span></Label>
          <Input v-model="form.productSku" placeholder="SKU000001" />
        </div>
        <div class="flex items-center gap-2">
          <Label>单位</Label>
          <Input v-model="form.unit" placeholder="个 / 斤 / 箱" />
        </div>
        <div class="flex items-center gap-2">
          <Label>销量<span class="text-destructive">*</span></Label>
          <Input v-model.number="form.qty" type="number" min="1" />
        </div>
        <div class="flex items-center gap-2">
          <Label>销售额 <span class="text-destructive">*</span></Label>
          <Input v-model.number="form.amount" type="number" min="0" step="0.01" />
        </div>
        <div class="flex items-center gap-2">
          <Label>上报日期 <span class="text-destructive">*</span></Label>
          <Input v-model="form.reportDate" type="date" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <Label>备注</Label>
          <Input v-model="form.remark" placeholder="高峰期 / 促销 / 团购等" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
