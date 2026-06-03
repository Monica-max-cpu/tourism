<script setup lang="ts">
/**
 * 门店 - 购物车
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】购物车结算
 * - 来自 Pinia + localStorage 持久化
 * - 勾选提交 跳转 OrderDetail（待支付）
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】购物车结算
 */
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-vue-next';
import { Button, Input, Label, Badge } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { BasicModal, useModal } from '/@/components/BasicModal';
import { useCartStore } from '/@/stores/modules/cart';
import { useUserStore } from '/@/stores/modules/user';
import { createStoreOrderApi } from '/@/api/store/order';
import { getStoreProfileApi } from '/@/api/store/sales';
import { formatCurrency } from '/@/utils/format';
import { getProductCover } from '/@/utils/mockProductImages';
import { ROUTE_PATHS } from '/@/constants/routePaths';

const router = useRouter();
const userStore = useUserStore();
const cartStore = useCartStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

cartStore.init(storeId.value);

function getCover(item: any): string {
  return getProductCover({
    ...item,
    id: item.catalogId,
  });
}

const deliveryAddress = reactive({
  recipientName: '',
  recipientPhone: '',
  address: '',
});
const submitting = ref(false);
const remark = ref('');
const checkout = useModal();

onMounted(async () => {
  if (!storeId.value) return;
  const profile = await getStoreProfileApi(storeId.value);
  if (profile) {
    deliveryAddress.recipientName = profile.receiver || profile.contactPerson || '';
    deliveryAddress.recipientPhone = profile.receiverPhone || profile.contactPhone || '';
    deliveryAddress.address = profile.receiveAddress || profile.address || '';
  }
});

function inc(catalogId: string) {
  const it = cartStore.getItems.find((x) => x.catalogId === catalogId);
  if (it) cartStore.updateQty(catalogId, it.qty + 1);
}
function dec(catalogId: string) {
  const it = cartStore.getItems.find((x) => x.catalogId === catalogId);
  if (it) cartStore.updateQty(catalogId, it.qty - 1);
}

function viewProduct(catalogId: string) {
  router.push(`/b2b/store/catalog/${catalogId}`);
}

const canCheckout = computed(
  () => cartStore.getSelectedItems.length > 0
    && !!deliveryAddress.recipientName
    && !!deliveryAddress.recipientPhone
    && !!deliveryAddress.address,
);

async function confirmCheckout() {
  if (!canCheckout.value) return;
  submitting.value = true;
  try {
    const items = cartStore.getSelectedItems.map((x) => ({
      catalogId: x.catalogId,
      quantity: x.qty,
    }));
    const payload = {
      deliveryAddress: { ...deliveryAddress },
      remark: remark.value,
      items,
    };
    const res: any = await createStoreOrderApi(storeId.value ? { ...payload, storeId: storeId.value } : payload);
    // 移除已下单商品
    cartStore.removeBatch(items.map((x) => x.catalogId));
    checkout.close();
    router.push(ROUTE_PATHS.STORE_ORDER_DETAIL.replace(':id', res.id));
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <PageWrapper title="购物车" subtitle="勾选后可一键提交订单（提交后将进入待支付）">
    <template #extra>
      <Badge variant="secondary">共 {{ cartStore.getCount }} 件商品</Badge>
    </template>

    <div v-if="cartStore.getItems.length === 0" class="bg-card border border-border rounded-lg py-20 text-center text-muted-foreground">
      <ShoppingBag class="w-10 h-10 mx-auto mb-3 opacity-30" />
      购物车空空如也
      <div class="mt-4">
        <Button @click="router.push(ROUTE_PATHS.STORE_CATALOG)">去选购</Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
      <!-- 左：列表 -->
      <div class="bg-card border border-border rounded-lg">
        <div class="px-4 py-3 border-b border-border flex items-center gap-3">
          <input type="checkbox" :checked="cartStore.isAllSelected" @change="cartStore.toggleSelectAll()" class="w-4 h-4" />
          <span class="text-sm">全选</span>
          <span class="text-xs text-muted-foreground ml-auto">已选 {{ cartStore.getSelectedItems.length }} 件</span>
          <Button variant="ghost" size="sm" :disabled="cartStore.getSelectedItems.length === 0"
            @click="cartStore.removeBatch(cartStore.getSelectedItems.map(x => x.catalogId))">
            <Trash2 class="w-3.5 h-3.5 mr-1" />移除选中
          </Button>
        </div>
        <div v-for="it in cartStore.getItems" :key="it.catalogId" class="px-4 py-3 border-b border-border last:border-0 flex items-center gap-3">
          <input type="checkbox" :checked="cartStore.selectedIds.includes(it.catalogId)"
            @change="cartStore.toggleSelect(it.catalogId)" class="w-4 h-4" />
          <img
            :src="getCover(it)"
            :alt="it.productName"
            class="w-14 h-14 object-cover rounded bg-muted cursor-pointer"
            loading="lazy"
            @click="viewProduct(it.catalogId)"
          />
          <div class="flex-1 min-w-0">
            <button
              type="button"
              class="text-sm font-medium truncate hover:text-primary text-left max-w-full"
              @click="viewProduct(it.catalogId)"
            >
              {{ it.productName }}
            </button>
            <div class="text-xs text-muted-foreground mt-0.5">{{ it.unit }}</div>
          </div>
          <div class="text-sm tabular-nums w-24 text-right">{{ formatCurrency(cartStore.getItemUnitPrice(it.catalogId)) }}</div>
          <div class="inline-flex items-center border border-border rounded">
            <button class="w-7 h-7 flex items-center justify-center hover:bg-muted" @click="dec(it.catalogId)"><Minus class="w-3 h-3" /></button>
            <span class="w-9 text-center text-sm tabular-nums">{{ it.qty }}</span>
            <button class="w-7 h-7 flex items-center justify-center hover:bg-muted" @click="inc(it.catalogId)"><Plus class="w-3 h-3" /></button>
          </div>
          <div class="text-base font-semibold text-primary tabular-nums w-28 text-right">
            {{ formatCurrency(cartStore.getItemLineTotal(it.catalogId)) }}
          </div>
          <Button variant="ghost" size="icon" class="h-7 w-7" @click="cartStore.removeItem(it.catalogId)">
            <Trash2 class="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

      <!-- 右：结算栏 -->
      <div class="bg-card border border-border rounded-lg p-4 h-fit sticky top-20">
        <div class="text-sm text-muted-foreground">合计金额</div>
        <div class="text-3xl font-bold text-primary tabular-nums mt-1">
          {{ formatCurrency(cartStore.getSelectedAmount) }}
        </div>
        <div class="text-xs text-muted-foreground mt-1">已选 {{ cartStore.getSelectedItems.length }} 件</div>

        <div class="border-t border-border my-4"></div>

        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <Label class="w-17" text-right>收货人 <span class="text-destructive">*</span></Label>
            <Input v-model="deliveryAddress.recipientName" placeholder="请输入收货人姓名" class="flex-1"/>
          </div>
          <div class="flex items-center gap-2">
            <Label class="w-17" >联系电话 <span class="text-destructive">*</span></Label>
            <Input v-model="deliveryAddress.recipientPhone" placeholder="请输入手机号" class="flex-1"/>
          </div>
          <div class="flex items-center gap-2">
            <Label class="w-17">收货地址 <span class="text-destructive">*</span></Label>
            <Input v-model="deliveryAddress.address" placeholder="请输入收货地址" class="flex-1"/>
          </div>
        </div>

        <Button class="w-full mt-4" :disabled="!canCheckout" @click="checkout.open()">
          提交订单
        </Button>
      </div>
    </div>

    <BasicModal
      v-model:open="checkout.visible.value"
      title="确认提交订单"
      description="提交后订单将进入「待支付」，请在支付中心上传支付凭证"
      :confirm-loading="submitting"
      :confirm-disabled="!canCheckout"
      width="500px"
      @confirm="confirmCheckout"
    >
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-muted-foreground">商品件数</span>
          <span class="tabular-nums">{{ cartStore.getSelectedItems.length }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">合计金额</span>
          <span class="text-primary font-bold tabular-nums">{{ formatCurrency(cartStore.getSelectedAmount) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted-foreground">收货</span>
          <span>{{ deliveryAddress.recipientName }} {{ deliveryAddress.recipientPhone }}</span>
        </div>
        <div class="text-muted-foreground">{{ deliveryAddress.address }}</div>
        <div class="space-y-1.5 pt-2">
          <Label>备注（选填）</Label>
          <Input v-model="remark" placeholder="特殊需求 / 配送时间..." />
        </div>
      </div>
    </BasicModal>
  </PageWrapper>
</template>
