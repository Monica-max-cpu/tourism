<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Card, CardContent, Input, Label } from '/@/components/ui';
import { supplierApplyApi } from '/@/api/b2b/apply';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import ApplyShell from './ApplyShell.vue';

const router = useRouter();
const submitting = ref(false);
const errorMsg = ref('');

const form = reactive({
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  province: '',
  city: '',
  address: '',
  remark: '',
});

async function onSubmit(e: Event) {
  e.preventDefault();
  if (!form.supplierName || !form.contactPerson || !form.contactPhone) {
    errorMsg.value = '请填写必填项（公司名称、联系人、联系电话）';
    return;
  }
  errorMsg.value = '';
  submitting.value = true;
  try {
    const res = await supplierApplyApi(form);
    router.push({
      path: ROUTE_PATHS.APPLY_RESULT,
      query: { type: 'supplier', applyNo: res.applyNo, name: res.name },
    });
  } catch (err) {
    errorMsg.value = (err as Error).message || '提交失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ApplyShell title="供应商入驻申请" subtitle="提交基础信息，平台将在 1-3 个工作日内完成审核">
    <Card>
      <CardContent class="p-6 md:p-8">
        <form class="space-y-6" @submit="onSubmit">
          <div class="space-y-1">
            <h3 class="text-sm font-semibold text-foreground">基础信息</h3>
            <p class="text-xs text-muted-foreground">公司名称与联系人为审核依据</p>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2 md:col-span-2">
              <Label>供应商名称 <span class="text-destructive">*</span></Label>
              <Input v-model="form.supplierName" placeholder="请输入公司全称" />
            </div>
            <div class="space-y-2">
              <Label>联系人 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
            </div>
            <div class="space-y-2">
              <Label>联系电话 <span class="text-destructive">*</span></Label>
              <Input v-model="form.contactPhone" placeholder="请输入手机号" />
            </div>
            <div class="space-y-2">
              <Label>联系邮箱</Label>
              <Input v-model="form.contactEmail" type="email" placeholder="选填" />
            </div>
            <div class="space-y-2">
              <Label>省份</Label>
              <Input v-model="form.province" placeholder="选填" />
            </div>
            <div class="space-y-2">
              <Label>城市</Label>
              <Input v-model="form.city" placeholder="选填" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>详细地址</Label>
              <Input v-model="form.address" placeholder="选填" />
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label>备注</Label>
              <Input v-model="form.remark" placeholder="可补充说明" />
            </div>
          </div>

          <p v-if="errorMsg" class="text-sm text-destructive">{{ errorMsg }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="$router.push(ROUTE_PATHS.LOGIN)">取消</Button>
            <Button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交申请' }}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </ApplyShell>
</template>
