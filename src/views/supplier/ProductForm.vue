<script setup lang="ts">
/**
 * 供应商 - 新建/编辑商品（二级页面）
 * 字段对齐 API 文档 3.1 / 3.2
 */
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Package, ArrowLeft, Save, Info } from 'lucide-vue-next';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge } from '/@/components/ui';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui';
import { PageWrapper } from '/@/components/PageWrapper';
import { saveSupplierProductApi, listSupplierProductsApi } from '/@/api/supplier/quote';
import { useUserStore } from '/@/stores/modules/user';
import { ROUTE_PATHS } from '/@/constants/routePaths';
import type { SupplierProduct } from '/#/b2b-supplier';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '');

const isEdit = computed(() => !!route.params.id);
const productId = computed(() => (route.params.id as string) || '');
const pageTitle = computed(() => (isEdit.value ? '编辑商品' : '新建商品'));
const pageDesc = computed(() =>
  isEdit.value ? '修改商品档案信息，保存后自动生效' : '填写商品信息并提交至商品库',
);

const submitting = ref(false);
const loading = ref(false);

const form = reactive({
  productName: '',
  brand: '',
  spec: '',
  unit: '箱',
  barcode: '',
  categoryId: '',
  images: '',
  description: '',
});

const formValid = computed(() => !!form.productName && !!form.unit);

const CATEGORY_OPTIONS = [
  { id: 'cat_001', name: '生鲜' },
  { id: 'cat_002', name: '乳制品' },
  { id: 'cat_003', name: '调味料' },
  { id: 'cat_004', name: '饮品' },
  { id: 'cat_005', name: '海鲜' },
  { id: 'cat_006', name: '菌菇' },
  { id: 'cat_007', name: '水果' },
  { id: 'cat_008', name: '冻品' },
];
const UNIT_OPTIONS = ['个', '斤', '箱', '克', '升', '瓶', '袋', '盒', '件', '吨'];

async function loadProduct() {
  if (!isEdit.value) return;
  loading.value = true;
  try {
    const result: any = await listSupplierProductsApi({
      pageNo: 1,
      pageSize: 100,
      supplierId: supplierId.value,
    });
    const product = result.records?.find((p: SupplierProduct) => p.id === productId.value);
    if (product) {
      Object.assign(form, {
        productName: product.productName || '',
        brand: product.brand || '',
        spec: product.spec || '',
        unit: product.unit || '箱',
        barcode: product.barcode || '',
        categoryId: product.categoryId || '',
        images: product.images || '',
        description: product.description || '',
      });
    }
  } finally {
    loading.value = false;
  }
}

onMounted(loadProduct);

async function handleSubmit() {
  if (!formValid.value) return;
  submitting.value = true;
  try {
    await saveSupplierProductApi({
      id: isEdit.value ? productId.value : '',
      supplierId: supplierId.value,
      productName: form.productName,
      unit: form.unit,
      brand: form.brand,
      spec: form.spec,
      barcode: form.barcode,
      categoryId: form.categoryId,
      images: form.images,
      description: form.description,
    } as any);
    router.push(ROUTE_PATHS.SUPPLIER_PRODUCTS);
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push(ROUTE_PATHS.SUPPLIER_PRODUCTS);
}
</script>

<template>
  <PageWrapper :title="pageTitle" :subtitle="pageDesc">
    <template #extra>
      <Button variant="outline" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回商品库
      </Button>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧：表单 占 3/4 -->
      <div class="lg:col-span-3">
        <Card class="border-border/40 shadow-xl overflow-hidden">
          <div class="h-2 bg-accent" />
          <CardHeader class="bg-muted/30 border-b border-border/20">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-accent/20 rounded-full">
                <Package class="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle class="text-xl">{{ pageTitle }}</CardTitle>
                <CardDescription>{{ pageDesc }}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent class="p-6 md:p-8">
            <div v-if="loading" class="flex items-center justify-center py-20">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span class="ml-3 text-sm text-muted-foreground">加载商品信息...</span>
            </div>

            <form v-else class="space-y-8" @submit.prevent="handleSubmit">
              <!-- 基础信息 -->
              <div>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="p-1 bg-primary/10 rounded">
                    <Info class="h-4 w-4 text-primary" />
                  </div>
                  <h4 class="text-base font-semibold">基础信息</h4>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  <div class="col-span-2 space-y-1.5">
                    <Label class="text-foreground/80">
                      商品名称 <Badge variant="secondary" class="ml-1 text-[10px]">必填</Badge>
                    </Label>
                    <Input v-model="form.productName" placeholder="请输入商品名称" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">品牌</Label>
                    <Input v-model="form.brand" placeholder="如：水塔" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">规格型号</Label>
                    <Input v-model="form.spec" placeholder="如：500ml×12瓶/箱" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">
                      计量单位 <Badge variant="secondary" class="ml-1 text-[10px]">必填</Badge>
                    </Label>
                    <Select v-model="form.unit">
                      <SelectTrigger><SelectValue placeholder="请选择单位" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">商品条码</Label>
                    <Input v-model="form.barcode" placeholder="如：6901234567890" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">品类</Label>
                    <Select v-model="form.categoryId">
                      <SelectTrigger><SelectValue placeholder="请选择品类" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <!-- 图片与描述 -->
              <div>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="p-1 bg-accent/10 rounded">
                    <Info class="h-4 w-4 text-accent-foreground" />
                  </div>
                  <h4 class="text-base font-semibold">图片与描述</h4>
                </div>
                <div class="space-y-5">
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">商品图片</Label>
                    <Input v-model="form.images" placeholder="图片 JSON 数组，如 [&quot;https://oss.example.com/img/1.jpg&quot;]" />
                    <p class="text-[11px] text-muted-foreground">支持 jpg、png 格式，单个文件不超过 5MB</p>
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-foreground/80">商品描述</Label>
                    <Input v-model="form.description" placeholder="产地、成分、特点等" />
                  </div>
                </div>
              </div>

              <!-- 提交 -->
              <div class="flex justify-between pt-6 border-t border-border">
                <Button type="button" variant="outline" @click="goBack">
                  <ArrowLeft class="w-4 h-4 mr-1.5" />
                  取消
                </Button>
                <Button :disabled="submitting || !formValid" class="shadow-lg shadow-primary/20 min-w-[140px]" @click="handleSubmit">
                  <Save v-if="!submitting" class="w-4 h-4 mr-1.5" />
                  <div v-else class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5" />
                  {{ submitting ? '保存中...' : (isEdit ? '保存修改' : '创建商品') }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- 右侧：提示面板 -->
      <div class="space-y-5">
        <div class="bg-accent/10 border border-accent/20 rounded-2xl p-5">
          <h4 class="font-bold text-accent-foreground mb-3 flex items-center gap-2">
            <Info class="w-4 h-4" />
            填写须知
          </h4>
          <ul class="space-y-2.5 text-sm">
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>带 <Badge variant="secondary" class="text-[10px] mx-0.5 align-middle">必填</Badge> 标记的字段为必填项</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>商品创建后默认"启用"状态，可用于创建报价</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
              <span>如需下架商品，可在商品库列表操作"停用"</span>
            </li>
          </ul>
        </div>

        <div class="bg-primary text-white rounded-2xl p-5 overflow-hidden relative">
          <div class="relative z-10">
            <h4 class="font-bold mb-2">需要帮助？</h4>
            <p class="text-sm text-primary-foreground/80 mb-3">
              如有商品录入疑问，请联系运营支持团队。
            </p>
            <div class="text-sm font-medium opacity-90">工作时间 9:00-18:00</div>
          </div>
          <div class="absolute -bottom-4 -right-4 opacity-10">
            <Package class="w-28 h-28" style="transform: rotate(-15deg)" />
          </div>
        </div>
      </div>
    </div>
  </PageWrapper>
</template>
