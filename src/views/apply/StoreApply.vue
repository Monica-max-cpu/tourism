<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Store, User, Phone, Mail, MapPin, FileText, BarChart3, HeadphonesIcon, Upload, CheckCircle, AlertCircle } from 'lucide-vue-next';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '/@/components/ui';
import { storeApplyApi } from '/@/api/b2b/apply';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import ApplyShell from './ApplyShell.vue';

const router = useRouter();
const submitting = ref(false);
const errorMsg = ref('');

const STORE_TYPES = [
  { value: 1, label: '普通门店' },
  { value: 2, label: '连锁门店' },
];

const form = reactive({
  storeName: '',
  storeType: 1 as number,
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  province: '',
  city: '',
  address: '',
  remark: '',
});

const qualifications = reactive<Record<string, string>>({
  businessLicense: '',
  healthPermit: '',
  foodBizLicense: '',
  other: '',
});

function simulateUpload(field: string) {
  qualifications[field] = `/mock/upload/${field}_${Date.now()}.jpg`;
}

function removeUpload(field: string) {
  qualifications[field] = '';
}

async function onSubmit(e: Event) {
  e.preventDefault();
  if (!form.storeName || !form.contactPerson || !form.contactPhone) {
    errorMsg.value = '请填写必填项';
    return;
  }
  if (!qualifications.businessLicense) {
    errorMsg.value = '请上传必填资质材料（营业执照）';
    return;
  }
  errorMsg.value = '';
  submitting.value = true;
  try {
    const res = await storeApplyApi({ ...form, ...qualifications });
    router.push({
      path: ROUTE_PATHS.APPLY_RESULT,
      query: { type: 'store', id: res.id, name: form.storeName },
    });
  } catch (err) {
    errorMsg.value = (err as Error).message || '提交失败';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <ApplyShell title="门店入驻申请" subtitle="提交基础信息，平台将在 1-3 个工作日内完成审核">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-15">
      <!-- 左侧：申请表 占 3/4 -->
      <div class="lg:col-span-3">
        <Card class="border-border/40 shadow-xl overflow-hidden">
          <div class="h-2 bg-emerald-500" />
          <CardHeader class="bg-muted/30 border-b border-border/20">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-50 rounded-full">
                <Store class="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle class="text-xl">门店入驻申请</CardTitle>
                <CardDescription>门店名称与类型为审核依据</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="p-6 md:p-8">
            <form class="space-y-6" @submit="onSubmit">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">门店名称 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <div class="relative">
                    <Store class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.storeName" placeholder="请输入门店名称" class="pl-10" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">门店类型 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Select v-model="form.storeType">
                    <SelectTrigger>
                      <SelectValue placeholder="请选择门店类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="t in STORE_TYPES" :key="t.value" :value="String(t.value)">{{ t.label }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">负责人 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <div class="relative">
                    <User class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.contactPerson" placeholder="请输入负责人姓名" class="pl-10" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">联系电话 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <div class="relative">
                    <Phone class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.contactPhone" placeholder="请输入手机号" class="pl-10" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">联系邮箱 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.contactEmail" type="email" placeholder="选填" class="pl-10" />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">省份 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.province" placeholder="选填" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">城市 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.city" placeholder="选填" />
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">详细地址 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <div class="relative">
                    <MapPin class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.address" placeholder="选填" class="pl-10" />
                  </div>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">备注说明 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <div class="relative">
                    <FileText class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="form.remark" placeholder="可补充说明门店特色、经营品类等信息" class="pl-10" />
                  </div>
                </div>
              </div>

              <!-- 资质材料 -->
              <div class="pt-2">
                <div class="flex items-center gap-3 mb-4">
                  <div class="p-1.5 bg-amber-100 rounded-full">
                    <FileText class="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold">资质材料</h3>
                    <p class="text-sm text-muted-foreground">请上传清晰的资质证明照片，支持 jpg、png 格式</p>
                  </div>
                </div>

                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 mb-6">
                  <AlertCircle class="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p class="font-medium text-amber-800">资质材料说明</p>
                    <p class="text-sm text-amber-700 mt-1">
                      请上传营业执照等相关资质照片。照片需清晰可辨，单个文件不超过 5MB。
                      <span class="text-amber-800 font-medium block mt-1">食品类门店需额外上传食品经营许可证</span>
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <Label class="text-foreground/80">营业执照 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                    <div
                      v-if="qualifications.businessLicense"
                      class="relative border-2 border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                      @click="removeUpload('businessLicense')"
                    >
                      <CheckCircle class="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p class="text-sm font-medium text-emerald-700">已上传</p>
                      <p class="text-xs text-muted-foreground mt-1">点击移除</p>
                    </div>
                    <div
                      v-else
                      class="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                      @click="simulateUpload('businessLicense')"
                    >
                      <Upload class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p class="text-sm font-medium">点击上传</p>
                      <p class="text-xs text-muted-foreground mt-1">jpg / png，不超过 5MB</p>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <Label class="text-foreground/80">卫生许可证 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                    <div
                      v-if="qualifications.healthPermit"
                      class="relative border-2 border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                      @click="removeUpload('healthPermit')"
                    >
                      <CheckCircle class="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p class="text-sm font-medium text-emerald-700">已上传</p>
                      <p class="text-xs text-muted-foreground mt-1">点击移除</p>
                    </div>
                    <div
                      v-else
                      class="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                      @click="simulateUpload('healthPermit')"
                    >
                      <Upload class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p class="text-sm font-medium">点击上传</p>
                      <p class="text-xs text-muted-foreground mt-1">jpg / png，不超过 5MB</p>
                    </div>
                  </div>
                </div>

                <!-- 食品类资质 -->
                <div class="mt-6">
                  <h4 class="font-medium mb-4 flex items-center gap-2">
                    食品类资质
                    <Badge variant="outline">食品类门店必填</Badge>
                  </h4>
                  <div class="space-y-2">
                    <Label class="text-foreground/80">食品经营许可证 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                    <div
                      v-if="qualifications.foodBizLicense"
                      class="relative border-2 border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors max-w-md"
                      @click="removeUpload('foodBizLicense')"
                    >
                      <CheckCircle class="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p class="text-sm font-medium text-emerald-700">已上传</p>
                      <p class="text-xs text-muted-foreground mt-1">点击移除</p>
                    </div>
                    <div
                      v-else
                      class="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors max-w-md"
                      @click="simulateUpload('foodBizLicense')"
                    >
                      <Upload class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p class="text-sm font-medium">点击上传</p>
                      <p class="text-xs text-muted-foreground mt-1">jpg / png，不超过 5MB</p>
                    </div>
                  </div>
                </div>

                <!-- 其他资质 -->
                <div class="mt-6">
                  <h4 class="font-medium mb-4">其他资质（选填）</h4>
                  <div class="space-y-2">
                    <Label class="text-foreground/80">其他补充资质 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                    <div
                      v-if="qualifications.other"
                      class="relative border-2 border-emerald-200 rounded-xl p-6 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors max-w-md"
                      @click="removeUpload('other')"
                    >
                      <CheckCircle class="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p class="text-sm font-medium text-emerald-700">已上传</p>
                      <p class="text-xs text-muted-foreground mt-1">点击移除</p>
                    </div>
                    <div
                      v-else
                      class="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors max-w-md"
                      @click="simulateUpload('other')"
                    >
                      <Upload class="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p class="text-sm font-medium">点击上传</p>
                      <p class="text-xs text-muted-foreground mt-1">jpg / png，不超过 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="errorMsg" class="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{{ errorMsg }}</p>

              <div class="flex justify-between pt-6 border-t border-border">
                <Button type="button" variant="outline" @click="router.push(ROUTE_PATHS.LOGIN)">取消</Button>
                <Button type="submit" :disabled="submitting" class="shadow-lg shadow-primary/20">
                  {{ submitting ? '提交中...' : '提交申请' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- 右侧：入驻权益 + 入驻咨询 -->
      <div class="space-y-6">
        <div class="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <h4 class="font-bold text-accent-foreground mb-4 flex items-center gap-2">
            <BarChart3 class="w-5 h-5" />
            入驻权益
          </h4>
          <ul class="space-y-3 text-sm">
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>覆盖全省 200+ A级景区核心门店</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>专享山西文旅平台金融授信支持</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>数字化营销工具与流量扶持计划</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>品牌官方背书及防伪溯源系统</span>
            </li>
          </ul>
        </div>

        <div class="bg-primary text-white rounded-2xl p-6 overflow-hidden relative">
          <div class="relative z-10">
            <h4 class="font-bold mb-2">入驻咨询</h4>
            <p class="text-sm text-primary-foreground/80 mb-4">
              如果您在入驻过程中有任何疑问，请联系我们的供应链专家。
            </p>
            <div class="text-lg font-bold">0351-888-6666</div>
          </div>
          <div class="absolute -bottom-6 -right-6 opacity-10">
            <HeadphonesIcon class="w-32 h-32" style="transform: rotate(-15deg)" />
          </div>
        </div>
      </div>
    </div>
  </ApplyShell>
</template>
