<script setup lang="ts">
/**
 * 供应商 - 企业资料维护
 * update-begin--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商企业资料
 * - 加载/编辑当前供应商的企业资料
 * - 切换「编取消」；保存时调 API
 * update-end--author:claude---date:2026-05-24---for:【B2B-阶段3】供应商企业资料
 */
import { reactive, ref, computed, onMounted } from 'vue';
import { Pencil, Save, X } from 'lucide-vue-next';
import {
  Button, Input, Label, Card, CardContent, CardHeader, CardTitle,
} from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { getSupplierProfileApi, updateSupplierProfileApi } from '/@/api/supplier/inventory';
import { formatDateTime } from '/@/utils/format';
import type { SupplierProfile } from '/#/b2b-supplier';

const editing = ref(false);
const saving = ref(false);
const updatedAt = ref('');

const form = reactive<SupplierProfile>({
  supplierId: '',
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  province: '',
  city: '',
  address: '',
  bankName: '',
  bankAccount: '',
  taxNo: '',
  businessLicenseUrl: '',
  description: '',
  updatedAt: '',
});

const valid = computed(() => !!form.supplierName && !!form.contactPerson && !!form.contactPhone);

async function loadProfile() {
  const data = await getSupplierProfileApi();
  if (data) {
    Object.assign(form, data);
    updatedAt.value = data.updatedAt;
  }
}
onMounted(() => loadProfile());

function startEdit() { editing.value = true; }
async function cancelEdit() { editing.value = false; await loadProfile(); }

async function save() {
  if (!valid.value) return;
  saving.value = true;
  try {
    await updateSupplierProfileApi({
      contactPerson: form.contactPerson,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      address: form.address,
      businessLicenseUrl: form.businessLicenseUrl,
    });
    editing.value = false;
    await loadProfile();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <PageWrapper title="企业资料" :subtitle="updatedAt ? `最近更新：${formatDateTime(updatedAt)}` : '维护您的企业基础资料与收款信息'">
    <template #extra>
      <template v-if="!editing">
        <Button @click="startEdit">
          <Pencil class="w-4 h-4 mr-1.5" />
          编辑资料
        </Button>
      </template>
      <template v-else>
        <Button variant="outline" :disabled="saving" @click="cancelEdit">
          <X class="w-4 h-4 mr-1.5" />
          取消
        </Button>
        <Button :disabled="!valid || saving" @click="save">
          <Save class="w-4 h-4 mr-1.5" />
          {{ saving ? '保存中...' : '保存' }}
        </Button>
      </template>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-2">
            <Label>企业名称 <span class="text-destructive">*</span></Label>
            <Input v-model="form.supplierName" :disabled="!editing" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <Label>联系人<span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPerson" :disabled="!editing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>联系电话 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPhone" :disabled="!editing" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Label>联系邮箱</Label>
            <Input v-model="form.contactEmail" :disabled="!editing" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center gap-2">
              <Label>省份</Label>
              <Input v-model="form.province" :disabled="!editing" />
            </div>
            <div class="flex items-center gap-2">
              <Label>城市</Label>
              <Input v-model="form.city" :disabled="!editing" />
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Label>详细地址</Label>
            <Input v-model="form.address" :disabled="!editing" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">收款与资质</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-2">
            <Label>开户行</Label>
            <Input v-model="form.bankName" :disabled="!editing" placeholder="如：招商银行上海分行" />
          </div>
          <div class="flex items-center gap-2">
            <Label>对公账号</Label>
            <Input v-model="form.bankAccount" :disabled="!editing" placeholder="对公收款账号" />
          </div>
          <div class="flex items-center gap-2">
            <Label>纳税人识别号</Label>
            <Input v-model="form.taxNo" :disabled="!editing" />
          </div>
          <div class="flex items-center gap-2">
            <Label>营业执照</Label>
            <div class="text-sm text-muted-foreground">
              {{ form.businessLicenseUrl ? form.businessLicenseUrl : '未上传（阶段 4 接入文件上传）' }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Label>企业简介</Label>
            <Input v-model="form.description" :disabled="!editing" placeholder="选填" />
          </div>
        </CardContent>
      </Card>
    </div>
  </PageWrapper>
</template>
