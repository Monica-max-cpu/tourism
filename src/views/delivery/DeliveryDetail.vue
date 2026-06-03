<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Building2, Clock, Hash, Package, Store, Truck } from 'lucide-vue-next';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { getDeliveryApi } from '/@/api/admin/fulfillment';
import { shipApi } from '/@/api/supplier/shipment';
import {
  DELIVERY_RECORD_STATUS_LABEL,
  DELIVERY_RECORD_STATUS_VARIANT,
  deliveryModeLabel,
} from '/@/constants/b2b2cStatus';
import { CARRIER_OPTIONS } from '/@/constants/supplierStatus';
import { formatDateTime } from '/@/utils/format';
import type { DeliveryRecord } from '/#/b2b-2c';

const route = useRoute();
const id = computed(() => route.params.id as string);
const isSupplierRoute = computed(() => route.path.includes('/b2b/supplier/'));

const detail = ref<DeliveryRecord | null>(null);
const loading = ref(false);

async function loadDetail() {
  loading.value = true;
  try {
    detail.value = await getDeliveryApi(id.value);
  } finally {
    loading.value = false;
  }
}

onMounted(loadDetail);
watch(id, loadDetail);

const shipModal = useModal<DeliveryRecord>();
const shipForm = reactive({ logisticsCompany: '顺丰速运', trackingNo: '', remark: '' });
const submitting = ref(false);
const shipValid = computed(() => !!shipForm.logisticsCompany && !!shipForm.trackingNo.trim());

function openShip() {
  if (!detail.value) return;
  shipForm.logisticsCompany = detail.value.logisticsCompany || '顺丰速运';
  shipForm.trackingNo = detail.value.trackingNo || '';
  shipForm.remark = detail.value.receiveRemark || '';
  shipModal.open(detail.value);
}

async function confirmShip() {
  if (!shipModal.data.value || !shipValid.value) return;
  submitting.value = true;
  try {
    await shipApi({
      deliveryId: shipModal.data.value.id,
      logisticsCompany: shipForm.logisticsCompany,
      trackingNo: shipForm.trackingNo.trim(),
      remark: shipForm.remark.trim() || undefined,
    });
    shipModal.close();
    await loadDetail();
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <PageWrapper
    title="履约订单详情"
    :subtitle="detail ? `${detail.deliveryNo} · 创建时间 ${formatDateTime(detail.createTime)}` : ''"
    show-back
  >
    <template v-if="detail" #extra>
      <Badge :variant="DELIVERY_RECORD_STATUS_VARIANT[detail.status] || 'warning'">
        {{ DELIVERY_RECORD_STATUS_LABEL[detail.status] || '-' }}
      </Badge>
      <Button v-if="isSupplierRoute && detail.status === 0" v-auth="'b2b:supplier:delivery'" size="sm" @click="openShip">
        <Truck class="w-4 h-4 mr-1.5" />登记发货
      </Button>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>
    <div v-else-if="!detail" class="text-center text-muted-foreground py-16">履约订单不存在或无访问权限</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      <div class="space-y-5">
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-6">
            <div class="flex items-center gap-2 mb-4">
              <Truck class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-semibold">发货信息</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-xs text-muted-foreground mb-1">发货单号</div>
                <div class="font-mono">{{ detail.deliveryNo }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">物流公司</div>
                <div>{{ detail.logisticsCompany || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">物流单号</div>
                <div class="font-mono">{{ detail.trackingNo || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">发货数量</div>
                <div>{{ detail.deliveryQty }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">收货数量</div>
                <div>{{ detail.receivedQty ?? '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">履约模式</div>
                <div>{{ deliveryModeLabel(detail.deliveryMode) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">发货时间</div>
                <div>{{ formatDateTime(detail.shippedTime) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">收货时间</div>
                <div>{{ formatDateTime(detail.receivedTime) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">备注/异常说明</div>
                <div>{{ detail.receiveRemark || '-' }}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-6">
            <div class="flex items-center gap-2 mb-4">
              <Package class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-semibold">关联集采明细</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-xs text-muted-foreground mb-1">集采单ID</div>
                <div class="font-mono break-all">{{ detail.collectiveOrderId }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">集采明细ID</div>
                <div class="font-mono break-all">{{ detail.collectiveItemId }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">商品</div>
                <div>{{ detail.productName || '-' }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">发货数量</div>
                <div>{{ detail.deliveryQty }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">已收数量</div>
                <div>{{ detail.receivedQty ?? 0 }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground mb-1">仓库ID</div>
                <div class="font-mono break-all">{{ detail.warehouseId || '-' }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-5">
        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-5 space-y-4">
            <div class="flex items-center gap-2">
              <Building2 class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-semibold">供应商</h3>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">供应商名称</div>
              <div>{{ detail.supplierName || '-' }}</div>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-5 space-y-4">
            <div class="flex items-center gap-2">
              <Store class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-semibold">收货门店</h3>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">门店名称</div>
              <div>{{ detail.storeName || '-' }}</div>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-lg shadow-sm">
          <CardContent class="p-5 space-y-3 text-sm">
            <div class="flex items-center gap-2">
              <Hash class="w-4 h-4 text-primary" />
              <h3 class="text-sm font-semibold">系统字段</h3>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted-foreground">发货单ID</span>
              <span class="font-mono text-right break-all">{{ detail.id }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted-foreground">状态值</span>
              <span>{{ DELIVERY_RECORD_STATUS_LABEL[detail.status] || detail.status }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-muted-foreground flex items-center gap-1"><Clock class="w-3 h-3" />更新时间</span>
              <span>{{ formatDateTime((detail as any).updateTime) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <BasicModal
      v-model:open="shipModal.visible.value"
      title="登记发货"
      :description="shipModal.data.value?.deliveryNo"
      :confirm-loading="submitting"
      :confirm-disabled="!shipValid"
      confirm-text="确认发货"
      width="520px"
      @confirm="confirmShip"
    >
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>物流公司 <span class="text-destructive">*</span></Label>
          <Select v-model="shipForm.logisticsCompany">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="carrier in CARRIER_OPTIONS" :key="carrier.value" :value="carrier.value">{{ carrier.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>物流单号 <span class="text-destructive">*</span></Label>
          <Input v-model="shipForm.trackingNo" placeholder="请输入物流单号" />
        </div>
        <div class="space-y-2">
          <Label>备注</Label>
          <Input v-model="shipForm.remark" placeholder="选填" />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
