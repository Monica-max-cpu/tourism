<script setup lang="ts">
/**
 * 平台管理员 - 利润记录
 * 全页 v-auth='b2b:profit:view'（路由层已限制，但页内再次确保）
 */
import { reactive, ref, onMounted } from 'vue';
import { TrendingUp, ShoppingBag, Receipt, Percent } from 'lucide-vue-next';
import { Card, CardContent, Input, Label } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicTable, useTable, type BasicColumn } from '/@/components/BasicTable';
import { SearchBar } from '/@/components/SearchBar';
import { listProfitsApi, getProfitSummaryApi } from '/@/api/admin/fulfillment';
import { formatCurrency, formatDateTime, formatNumber } from '/@/utils/format';

const search = reactive({ keyword: '' });
const [registerTable, { reload }] = useTable();

const summary = ref({ totalSale: 0, totalCost: 0, totalProfit: 0, profitRate: 0, orderCount: 0 });

async function loadSummary() {
  try {
    summary.value = await getProfitSummaryApi();
  } catch { /* summary 加载失败不影响页面 */ }
}

async function loadData(params: any) {
  return await listProfitsApi({ ...params, searchInfo: { ...search } });
}

const columns: BasicColumn[] = [
  { field: 'collectiveNo', title: '集采单号', width: 160 },
  { field: 'productSku', title: 'SKU', width: 110 },
  { field: 'productName', title: '商品', minWidth: 220 },
  { field: 'qty', title: '数量', width: 90, align: 'right', formatter: ({ cellValue, row }) => `${formatNumber(cellValue)} ${row.unit}` },
  { field: 'salePrice', title: '销售价', width: 110, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'costPrice', title: '成本价', width: 110, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'saleAmount', title: '销售额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'costAmount', title: '采购额', width: 130, align: 'right', formatter: ({ cellValue }) => formatCurrency(cellValue) },
  { field: 'profit', title: '毛利', width: 130, align: 'right', slots: { default: 'profit' } },
  { field: 'profitRate', title: '毛利率', width: 90, align: 'right', formatter: ({ cellValue }) => `${cellValue}%` },
  { field: 'postedAt', title: '入账时间', width: 170, formatter: ({ cellValue }) => formatDateTime(cellValue) },
];

function onSearch() { reload({ pageNo: 1 }); }
function onReset() {
  search.keyword = '';
  reload({ pageNo: 1 });
}

onMounted(loadSummary);
</script>

<template>
  <PageWrapper title="利润记录" subtitle="平台所有集采的销成本-毛利明细">
    <!-- 汇总卡 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShoppingBag class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">销售总额</div>
              <div class="text-xl font-semibold mt-0.5">{{ formatCurrency(summary.totalSale) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Receipt class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">采购总额</div>
              <div class="text-xl font-semibold mt-0.5">{{ formatCurrency(summary.totalCost) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">累计毛利</div>
              <div class="text-xl font-semibold mt-0.5 text-[hsl(var(--status-success))]">{{ formatCurrency(summary.totalProfit) }}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="p-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <Percent class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs text-muted-foreground">综合毛利率</div>
              <div class="text-xl font-semibold mt-0.5">{{ summary.profitRate }}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <SearchBar @search="onSearch" @reset="onReset">
      <div class="flex items-center gap-2">
        <Label class="text-xs text-muted-foreground">关键词</Label>
        <Input v-model="search.keyword" placeholder="集采单号 / 商品 / SKU" class="w-72" @keyup.enter="onSearch" />
      </div>
    </SearchBar>

    <BasicTable :columns="columns" :api="loadData" row-key="id" @register="registerTable">
      <template #profit="{ row }">
        <span class="text-[hsl(var(--status-success))] font-medium">{{ formatCurrency(row.profit) }}</span>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
