<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Store, BarChart3, HeadphonesIcon, Image } from 'lucide-vue-next';
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
import { storeApplyApi, publicOnboardingApplyApi } from '/@/api/b2b/apply';
import { normalizeUploadUrl, normalizeUploadUrls, uploadFilesApi, uploadImageApi } from '/@/api/common/upload';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import { STORE_TYPE_OPTIONS } from '/@/constants/b2bStatus';
import { useUserStore } from '/@/stores/modules/user';
import MapLocationPicker from '/@/components/MapLocationPicker.vue';
import ApplyShell from './ApplyShell.vue';

const router = useRouter();
const userStore = useUserStore();
const submitting = ref(false);
const errorMsg = ref('');
const uploadingLogo = ref(false);
const uploadingLicense = ref(false);
const uploadingStorePhotos = ref(false);

const form = reactive({
  storeName: '',
  storeType: '1',
  authType: 'MERCHANT',
  logoId: '',
  mainCategory: '',
  categoryIds: '',
  businessLicense: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  province: '',
  city: '',
  address: '',
  bankAccount: '',
  bankName: '',
  bankNo: '',
  description: '',
  storePhotos: '',
  mapAddress: '',
  coordinate: '',
  supplySourceId: '',
  creditLimit: '',
});

function removeUpload(field: string) {
  (form as Record<string, string>)[field] = '';
}

async function uploadSingleImage(field: 'logoId' | 'businessLicense', file: File) {
  errorMsg.value = '';
  if (field === 'logoId') uploadingLogo.value = true;
  if (field === 'businessLicense') uploadingLicense.value = true;
  try {
    const result = await uploadImageApi(file);
    const url = normalizeUploadUrl(result.singleUrl || result.urls[0] || '');
    if (!url) throw new Error('未获取到上传地址');
    (form as Record<string, string>)[field] = url;
  } catch (err) {
    errorMsg.value = (err as Error).message || '图片上传失败';
  } finally {
    if (field === 'logoId') uploadingLogo.value = false;
    if (field === 'businessLicense') uploadingLicense.value = false;
  }
}

async function addStorePhoto(files: FileList | File[]) {
  const list = Array.from(files);
  if (!list.length) return;
  uploadingStorePhotos.value = true;
  errorMsg.value = '';
  try {
    const result = await uploadFilesApi(list);
    const uploaded = result.urls.length ? normalizeUploadUrls(result.urls) : (result.singleUrl ? [normalizeUploadUrl(result.singleUrl)] : []);
    if (!uploaded.length) throw new Error('未获取到上传地址');
    form.storePhotos = form.storePhotos ? `${form.storePhotos},${uploaded.join(',')}` : uploaded.join(',');
  } catch (err) {
    errorMsg.value = (err as Error).message || '图片上传失败';
  } finally {
    uploadingStorePhotos.value = false;
  }
}

function pickSingleImage(field: 'logoId' | 'businessLicense') {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    await uploadSingleImage(field, file);
  };
  input.click();
}

function pickStorePhotos() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = async () => {
    const files = input.files;
    if (!files?.length) return;
    await addStorePhoto(files);
  };
  input.click();
}

function removeStorePhoto(index: number) {
  const list = form.storePhotos.split(',').filter(Boolean);
  list.splice(index, 1);
  form.storePhotos = list.join(',');
}

function onLocationSelect(data: { province: string; city: string; address: string; mapAddress: string; coordinate: string }) {
  form.province = data.province;
  form.city = data.city;
  form.address = data.address;
  form.mapAddress = data.mapAddress;
  form.coordinate = data.coordinate;
}

async function onSubmit(e: Event) {
  e.preventDefault();
  if (!form.storeName || !form.contactPerson || !form.contactPhone || !form.address || !form.mainCategory) {
    errorMsg.value = '请填写必填项（门店名称、主营类别、负责人、联系电话、详细地址）';
    return;
  }
  if (!form.businessLicense) {
    errorMsg.value = '请上传营业执照';
    return;
  }
  errorMsg.value = '';
  submitting.value = true;
  try {
    if (userStore.getToken) {
      // 登录入驻 — 不传 merchantType
      await storeApplyApi({ ...form, storeType: Number(form.storeType), creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined });
      router.push(ROUTE_PATHS.ENTRY_B2B);
    } else {
      // 公开入驻 — 字段名用 name，加 merchantType
      const { storeName, ...rest } = form;
      const res = await publicOnboardingApplyApi({
        ...rest,
        merchantType: 'STORE',
        name: String(storeName),
        storeType: Number(form.storeType),
        creditLimit: form.creditLimit ? Number(form.creditLimit) : undefined,
      });
      router.push({
        path: ROUTE_PATHS.APPLY_RESULT,
        query: { type: 'store', id: res.merchantId || res.id, name: form.storeName },
      });
    }
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
                  <Input v-model="form.storeName" placeholder="请输入门店名称" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">认证类型</Label>
                  <div class="h-10 flex items-center px-3 rounded-md border border-border bg-muted/50 text-sm text-foreground/70">商户</div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">店铺类别 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Select v-model="form.storeType">
                    <SelectTrigger>
                      <SelectValue placeholder="请选择店铺类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="t in STORE_TYPE_OPTIONS.filter((o) => o.value)" :key="t.value" :value="t.value">{{ t.label }}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">主营类别 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Input v-model="form.mainCategory" placeholder="如：文创零售、餐饮、特产" />
                </div>
<!-- 
                <div class="space-y-2">
                  <Label class="text-foreground/80">经营品类 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.categoryIds" placeholder="多个品类用逗号分隔" />
                </div> -->

                <div class="space-y-2">
                  <Label class="text-foreground/80">联系人 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Input v-model="form.contactPerson" placeholder="请输入负责人姓名" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">联系电话 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Input v-model="form.contactPhone" placeholder="请输入手机号" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">联系邮箱 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.contactEmail" type="email" placeholder="选填" />
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">地图定位 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <MapLocationPicker :model-value="form.coordinate" @select="onLocationSelect" />
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">详细地址 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <Input v-model="form.address" placeholder="门牌号、楼层等补充信息" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">开户行 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.bankName" placeholder="如：中国银行太原分行" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">银行账号 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.bankAccount" placeholder="结算收款账号" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">开户行号 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.bankNo" placeholder="联行号 / 开户行号" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">关联供应商来源 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.supplySourceId" placeholder="cm_supply_supplier.id（如有）" />
                </div>

                <!-- <div class="space-y-2">
                  <Label class="text-foreground/80">信用额度 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <Input v-model="form.creditLimit" type="number" min="0" step="0.01" placeholder="预留字段，可不填" />
                </div> -->

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">门店简介 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <textarea v-model="form.description" rows="4" placeholder="门店特色、经营能力、服务范围等" class="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none" />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">Logo 文件 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <div
                    v-if="form.logoId"
                    class="relative border-2 border-emerald-200 rounded-xl p-4 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                    @click="removeUpload('logoId')"
                  >
                    <p class="text-sm font-medium text-emerald-700">已上传</p>
                    <p class="text-xs text-muted-foreground mt-1 truncate">{{ form.logoId }}</p>
                    <p class="text-xs text-muted-foreground">点击移除</p>
                  </div>
                  <div
                    v-else
                    class="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                    @click="pickSingleImage('logoId')"
                  >
                    <Image class="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p class="text-sm font-medium">点击上传</p>
                    <p class="text-xs text-muted-foreground mt-1">品牌 Logo，jpg / png</p>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground/80">营业执照 <Badge variant="secondary" class="ml-1">必填</Badge></Label>
                  <div
                    v-if="form.businessLicense"
                    class="relative border-2 border-emerald-200 rounded-xl p-4 text-center bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                    @click="removeUpload('businessLicense')"
                  >
                    <p class="text-sm font-medium text-emerald-700">已上传</p>
                    <p class="text-xs text-muted-foreground mt-1 truncate">{{ form.businessLicense }}</p>
                    <p class="text-xs text-muted-foreground">点击移除</p>
                  </div>
                  <div
                    v-else
                    class="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                    @click="pickSingleImage('businessLicense')"
                  >
                    <Image class="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p class="text-sm font-medium">点击上传</p>
                    <p class="text-xs text-muted-foreground mt-1">营业执照照片，jpg / png</p>
                  </div>
                </div>

                <div class="space-y-2 md:col-span-2">
                  <Label class="text-foreground/80">店铺照片 <Badge variant="outline" class="ml-1">选填</Badge></Label>
                  <div class="flex flex-wrap gap-3">
                    <div
                      v-for="(_url, idx) in form.storePhotos.split(',').filter(Boolean)"
                      :key="idx"
                      class="relative border-2 border-emerald-200 rounded-xl p-3 w-24 h-24 flex flex-col items-center justify-center bg-emerald-50/50 group cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"
                      @click="removeStorePhoto(idx)"
                    >
                      <Image class="h-6 w-6 text-emerald-500 group-hover:text-red-400 transition-colors" />
                      <p class="text-xs text-muted-foreground mt-1 truncate w-full text-center">图{{ idx + 1 }}</p>
                      <p class="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">点击移除</p>
                    </div>
                    <div
                      class="border-2 border-dashed border-border rounded-xl p-3 w-24 h-24 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                      @click="pickStorePhotos()"
                    >
                      <Image class="h-6 w-6 text-muted-foreground mb-1" />
                      <p class="text-xs text-muted-foreground">添加照片</p>
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
