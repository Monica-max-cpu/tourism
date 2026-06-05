<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Building2, MapPin, Pencil, Save } from 'lucide-vue-next';
import {
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
import { getStoreProfileApi, updateStoreProfileApi } from '/@/api/store/sales';
import { STORE_TYPE_LABEL, STORE_TYPE_OPTIONS } from '/@/constants/storeStatus';
import { useUserStore } from '/@/stores/modules/user';
import type { StoreProfile } from '/#/b2b-store';

const userStore = useUserStore();
const storeId = computed(() => userStore.getUserInfo?.storeId || '');

const form = reactive<StoreProfile>({
  storeId: '',
  storeName: '',
  storeType: 'INDEPENDENT',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  province: '',
  city: '',
  address: '',
  receiveAddress: '',
  receiver: '',
  receiverPhone: '',
  description: '',
  updatedAt: '',
});
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const backup = ref<StoreProfile | null>(null);

async function loadProfile() {
  loading.value = true;
  try {
    const profile = await getStoreProfileApi(storeId.value || 'mock-store');
    if (profile) {
      Object.assign(form, profile);
      backup.value = { ...profile };
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
      storeName: form.storeName,
      storeType: form.storeType,
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      province: form.province,
      city: form.city,
      address: form.address,
      receiveAddress: form.receiveAddress,
      receiver: form.receiver,
      receiverPhone: form.receiverPhone,
      description: form.description,
    });
    backup.value = { ...form };
    isEditing.value = false;
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

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card class="lg:col-span-2">
        <CardContent class="p-5 space-y-4">
          <div class="flex items-center gap-2 text-sm font-medium">
            <Building2 class="w-4 h-4 text-primary" />基本信息
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 md:col-span-2">
              <Label>门店名称 <span class="text-destructive">*</span></Label>
              <Input v-model="form.storeName" :readonly="!isEditing" />
            </div>
            <div class="space-y-2">
              <Label>店铺类别</Label>
              <Select v-model="form.storeType" :disabled="!isEditing">
                <SelectTrigger><SelectValue :placeholder="STORE_TYPE_LABEL[form.storeType]" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in STORE_TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>主营类别</Label>
              <Input :model-value="form.storeId" readonly class="bg-muted" />
            </div>
            <div class="space-y-2">
              <Label>联系人 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPerson" :readonly="!isEditing" />
            </div>
            <div class="space-y-2">
              <Label>联系电话 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPhone" :readonly="!isEditing" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>联系邮箱</Label>
              <Input v-model="form.contactEmail" type="email" :readonly="!isEditing" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>详细地址</Label>
              <Input v-model="form.address" :readonly="!isEditing" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>门店简介</Label>
              <Input v-model="form.description" :readonly="!isEditing" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-5 space-y-4">
          <div class="flex items-center gap-2 text-sm font-medium">
            <MapPin class="w-4 h-4 text-emerald-600" />默认收货信息
          </div>
          <div class="text-xs text-muted-foreground -mt-2">下单时自动带出，可在购物车结算时修改。</div>
          <div class="space-y-4">
            <div class="space-y-2">
              <Label>收货人</Label>
              <Input v-model="form.receiver" :readonly="!isEditing" />
            </div>
            <div class="space-y-2">
              <Label>收货电话</Label>
              <Input v-model="form.receiverPhone" :readonly="!isEditing" />
            </div>
            <div class="space-y-2">
              <Label>收货地址</Label>
              <Input v-model="form.receiveAddress" :readonly="!isEditing" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
</template>
