<script setup lang="ts">
/**
 * 门店 - 门店资料
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段4】门店资料
 * - 加载 / 编辑 / 保存
 * - 收货信息默认作为下单时的带出）
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段4】门店资 */
import { reactive, ref, computed, onMounted } from 'vue';
import { Save, Building2, MapPin, Pencil } from 'lucide-vue-next';
import {
  Button, Input, Label, Card, CardContent,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getStoreProfileApi, updateStoreProfileApi } from '/@/api/store/sales';
import { STORE_TYPE_OPTIONS, STORE_TYPE_LABEL } from '/@/constants/storeStatus';
import { useUserStore } from '/@/stores/modules/user';
import type { StoreProfile } from '/#/b2b-store';

const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const form = reactive<StoreProfile>({
  storeId: '', storeName: '', storeType: 'INDEPENDENT',
  contactPerson: '', contactPhone: '', contactEmail: '',
  province: '', city: '', address: '',
  receiveAddress: '', receiver: '', receiverPhone: '',
  description: '',
  updatedAt: '',
});
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);

const backup = ref<StoreProfile | null>(null);

async function loadProfile() {
  if (!storeId.value) return;
  loading.value = true;
  try {
    const p = await getStoreProfileApi(storeId.value);
    if (p) {
      Object.assign(form, p);
      backup.value = { ...p };
    }
  } finally {
    loading.value = false;
  }
}
onMounted(loadProfile);

const formValid = computed(() => !!form.storeName && !!form.contactPerson && !!form.contactPhone);

function cancelEdit() {
  if (backup.value) Object.assign(form, backup.value);
  isEditing.value = false;
}

async function save() {
  if (!formValid.value) return;
  saving.value = true;
  try {
    await updateStoreProfileApi({
      storeName: form.storeName, storeType: form.storeType,
      contactPerson: form.contactPerson, contactPhone: form.contactPhone, contactEmail: form.contactEmail,
      province: form.province, city: form.city, address: form.address,
      receiveAddress: form.receiveAddress, receiver: form.receiver, receiverPhone: form.receiverPhone,
      description: form.description,
    });
    isEditing.value = false;
    await loadProfile();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <PageWrapper title="门店资料" subtitle="维护门店基本信息与默认收货地址">
    <template #extra>
      <Button v-if="!isEditing" @click="isEditing = true">
        <Pencil class="w-4 h-4 mr-1.5" />编辑
      </Button>
      <template v-else>
        <Button variant="outline" :disabled="saving" @click="cancelEdit">取消</Button>
        <Button :disabled="!formValid || saving" class="ml-2" @click="save">
          <Save class="w-4 h-4 mr-1.5" />{{ saving ? '保存中...' : '保存' }}
        </Button>
      </template>
    </template>

    <div v-if="loading" class="text-center text-muted-foreground py-12">加载中...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- 基本信息 -->
      <Card>
        <CardContent class="p-5 space-y-4">
          <div class="flex items-center gap-2 text-sm font-medium">
            <Building2 class="w-4 h-4 text-primary" />基本信息
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5 col-span-2">
              <Label>门店名称 <span class="text-destructive">*</span></Label>
              <Input v-model="form.storeName" :readonly="!isEditing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>门店类型</Label>
              <Select v-model="form.storeType" :disabled="!isEditing">
                <SelectTrigger><SelectValue :placeholder="STORE_TYPE_LABEL[form.storeType]" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="o in STORE_TYPE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-center gap-2">
              <Label>门店编号</Label>
              <Input :model-value="form.storeId" readonly class="bg-muted" />
            </div>
            <div class="flex items-center gap-2">
              <Label>联系人<span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPerson" :readonly="!isEditing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>联系电话 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPhone" :readonly="!isEditing" />
            </div>
            <div class="space-y-1.5 col-span-2">
              <Label>联系邮箱</Label>
              <Input v-model="form.contactEmail" type="email" :readonly="!isEditing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>省份</Label>
              <Input v-model="form.province" :readonly="!isEditing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>城市</Label>
              <Input v-model="form.city" :readonly="!isEditing" />
            </div>
            <div class="space-y-1.5 col-span-2">
              <Label>详细地址</Label>
              <Input v-model="form.address" :readonly="!isEditing" />
            </div>
            <div class="space-y-1.5 col-span-2">
              <Label>门店简介</Label>
              <Input v-model="form.description" :readonly="!isEditing" placeholder="商圈位置、客流情况等" />
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 默认收货 -->
      <Card>
        <CardContent class="p-5 space-y-4">
          <div class="flex items-center gap-2 text-sm font-medium">
            <MapPin class="w-4 h-4 text-emerald-600" />默认收货信息
          </div>
          <div class="text-xs text-muted-foreground -mt-2">下单时将自动带出此信息，可在购物车结算时修改</div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <Label>收货人</Label>
              <Input v-model="form.receiver" :readonly="!isEditing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>收货电话</Label>
              <Input v-model="form.receiverPhone" :readonly="!isEditing" />
            </div>
            <div class="space-y-1.5 col-span-2">
              <Label>收货地址</Label>
              <Input v-model="form.receiveAddress" :readonly="!isEditing" placeholder="xx 省 xx 市 xx 区" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
</template>
