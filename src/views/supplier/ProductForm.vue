<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, PackageCheck, ShieldCheck, Truck, Image, Upload, Trash2, Warehouse } from 'lucide-vue-next'
import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui'
import { PageWrapper } from '/@/components/PageWrapper'
import StoreProductDetailShowcase from '/@/components/store/StoreProductDetailShowcase.vue'
import { saveSupplierProductApi, listSupplierProductsApi } from '/@/api/supplier/quote'
import { listWarehousesApi } from '/@/api/supplier/warehouse'
import { uploadFilesApi } from '/@/api/common/upload'
import { ROUTE_PATHS } from '/@/constants/routePaths'
import type { SupplierProduct, SupplierWarehouse } from '/#/b2b-supplier'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const productId = computed(() => (route.params.id as string) || '')
const pageTitle = computed(() => (isEdit.value ? '编辑商品' : '新建商品'))
const pageDesc = computed(() => (isEdit.value ? '完善商品主数据，让平台目录和门店采购页展示更完整' : '填写商品主数据，后续报价与门店采购展示会直接沿用'))

const submitting = ref(false)
const uploadingImages = ref(false)
const loading = ref(false)
const productNameInput = ref<HTMLInputElement | null>(null)
const warehouseOptions = ref<SupplierWarehouse[]>([])

const form = reactive({
  productName: '',
  brand: '',
  spec: '',
  unit: '箱',
  barcode: '',
  categoryId: '',
  warehouseId: '',
  images: '',
  description: '',
  originPlace: '',
  packageSpec: '',
  storageCondition: '',
  shelfLife: '',
  applicableScene: '',
  afterSaleNote: '',
})

const formValid = computed(() => !!form.productName && !!form.unit && !!form.categoryId && imagePreviews.value.length > 0)

const CATEGORY_OPTIONS = [
  { id: 'cat_001', name: '生鲜' },
  { id: 'cat_002', name: '乳制品' },
  { id: 'cat_003', name: '调味品' },
  { id: 'cat_004', name: '饮品' },
  { id: 'cat_005', name: '海鲜' },
  { id: 'cat_006', name: '菌菇' },
  { id: 'cat_007', name: '水果' },
  { id: 'cat_008', name: '冻品' },
]
const UNIT_OPTIONS = ['箱', '袋', '瓶', 'kg', '盒', '件', '包', '罐', '斤', '片', '盘', '组', '套', '份']

const currentCategoryName = computed(() => CATEGORY_OPTIONS.find((c) => c.id === form.categoryId)?.name || '')
const currentWarehouseName = computed(() => warehouseOptions.value.find((w) => w.id === form.warehouseId)?.warehouseName || '')
const previewSpecs = computed(() => [
  { label: '分类', value: currentCategoryName.value || '未选择' },
  { label: '品牌', value: form.brand || '待补充' },
  { label: '规格', value: form.spec || '待补充' },
  { label: '单位', value: form.unit || '-' },
  { label: '条码', value: form.barcode || '-' },
  { label: '仓库', value: currentWarehouseName.value || '非必填' },
])
const previewDetails = computed(() => [
  { label: '产地', value: form.originPlace || '待补充' },
  { label: '包装规格', value: form.packageSpec || '待补充' },
  { label: '储存条件', value: form.storageCondition || '待补充' },
  { label: '保质期', value: form.shelfLife || '待补充' },
  { label: '适用场景', value: form.applicableScene || '待补充' },
  { label: '售后说明', value: form.afterSaleNote || '待补充' },
])
const previewDetailText = computed(() => previewDetails.value.map((detail) => `${detail.label}：${detail.value}`).join('；') || '补充更多商品说明后，门店页会更完整。')
const previewTips = [
  '商品名称、品类、单位、主图会同步到门店采购页和商品详情页。',
  '产地、包装规格、储存条件、保质期这些字段会直接进入商品详情。',
  '图片至少上传 1 张，便于后续审核和平台目录展示。',
]
const previewDescription = computed(() => form.description || '补充商品介绍、口感 / 材质 / 卖点 / 使用说明等内容，门店采购页会更完整。')
const previewImages = computed(() => imagePreviews.value)
const previewCurrentImageIdx = ref(0)
const previewHighlights = computed(() => [
  { label: '稳定供应', value: '以上内容会同步到门店采购页和商品详情页', icon: PackageCheck },
  { label: '品质可控', value: previewDescription.value, icon: ShieldCheck },
  { label: '配送履约', value: '下单后进入集采和发货流程，便于门店按同一页面决策', icon: Truck },
])

const fileInputRef = ref<HTMLInputElement | null>(null)
const imagePreviews = ref<string[]>([])

function triggerUpload() {
  fileInputRef.value?.click()
}

async function handleImageFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
  if (!imageFiles.length) return
  uploadingImages.value = true
  try {
    const result = await uploadFilesApi(imageFiles)
    const uploaded = result.urls.length ? result.urls : (result.singleUrl ? [result.singleUrl] : [])
    if (!uploaded.length) throw new Error('未获取到上传地址')
    const hadImages = imagePreviews.value.length > 0
    imagePreviews.value.push(...uploaded)
    form.images = JSON.stringify(imagePreviews.value)
    if (!hadImages) previewCurrentImageIdx.value = 0
  } finally {
    uploadingImages.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

function removeImage(index: number) {
  imagePreviews.value.splice(index, 1)
  form.images = imagePreviews.value.length ? JSON.stringify(imagePreviews.value) : ''
  previewCurrentImageIdx.value = Math.max(0, Math.min(previewCurrentImageIdx.value, imagePreviews.value.length - 1))
}

function changePreviewImage(step: number) {
  if (previewImages.value.length <= 1) return
  previewCurrentImageIdx.value = (previewCurrentImageIdx.value + step + previewImages.value.length) % previewImages.value.length
}

function setPreviewImage(index: number) {
  previewCurrentImageIdx.value = index
}

async function loadProduct() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const result: any = await listSupplierProductsApi({ pageNo: 1, pageSize: 200 })
    const product = result.records?.find((p: SupplierProduct) => p.id === productId.value)
    if (product) {
      Object.assign(form, {
        productName: product.productName || '',
        brand: product.brand || '',
        spec: product.spec || '',
        unit: product.unit || '箱',
        barcode: product.barcode || '',
        categoryId: product.categoryId || '',
        warehouseId: product.warehouseId || '',
        images: product.images || '',
        description: product.description || '',
        originPlace: (product as any).originPlace || '',
        packageSpec: (product as any).packageSpec || '',
        storageCondition: (product as any).storageCondition || '',
        shelfLife: (product as any).shelfLife || '',
        applicableScene: (product as any).applicableScene || '',
        afterSaleNote: (product as any).afterSaleNote || '',
      })
      if (product.images) {
        try {
          imagePreviews.value = JSON.parse(product.images)
        } catch {
          imagePreviews.value = [product.images]
        }
      }
    }
  } finally {
    loading.value = false
  }
}

async function loadWarehouseOptions() {
  try {
    const result: any = await listWarehousesApi({ pageNo: 1, pageSize: 200 })
    warehouseOptions.value = result.records || result || []
  } catch {
    warehouseOptions.value = []
  }
}

onMounted(async () => {
  await loadWarehouseOptions()
  await loadProduct()
  if (!isEdit.value) {
    await nextTick()
    productNameInput.value?.focus()
  }
})

async function handleSubmit() {
  if (!formValid.value) return
  submitting.value = true
  try {
    await saveSupplierProductApi({
      id: isEdit.value ? productId.value : '',
      productName: form.productName,
      unit: form.unit,
      brand: form.brand,
      spec: form.spec,
      barcode: form.barcode,
      categoryId: form.categoryId,
      warehouseId: form.warehouseId || undefined,
      images: form.images,
      description: form.description,
      originPlace: form.originPlace,
      packageSpec: form.packageSpec,
      storageCondition: form.storageCondition,
      shelfLife: form.shelfLife,
      applicableScene: form.applicableScene,
      afterSaleNote: form.afterSaleNote,
    } as any)
    router.push(ROUTE_PATHS.SUPPLIER_PRODUCTS)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push(ROUTE_PATHS.SUPPLIER_PRODUCTS)
}
</script>

<template>
  <PageWrapper :title="pageTitle" :subtitle="pageDesc">
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回商品库      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载商品信息...</span>
    </div>

    <form v-else class="pt-4 pb-16" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 xl:grid-cols-[minmax(360px,0.92fr)_minmax(520px,1.28fr)] gap-5">
        <div class="space-y-5">
          <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
            <div class="flex items-center gap-2.5">
              <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                <Package class="w-3.5 h-3.5 text-[#1A2C54]" />
              </div>
              <h4 class="text-lg font-semibold text-[#1A2C54]">基础信息</h4>
            </div>

            <div class="mt-6 space-y-5">
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">商品名称
                  <span class="text-red-400">*</span>
                </Label>
                <input
                  ref="productNameInput"
                  v-model="form.productName"
                  type="text"
                  placeholder="请输入商品名称"
                  class="brand-focus-input flex h-12 w-full rounded-xl border bg-white px-4 py-2 text-[15px] placeholder:text-muted-foreground/60 outline-none transition-shadow"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">品牌</Label>
                  <Input v-model="form.brand" placeholder="如：水塔" class="h-12 rounded-xl text-[15px]" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">规格型号</Label>
                  <Input v-model="form.spec" placeholder="如：500ml×12瓶/箱"class="h-12 rounded-xl text-[15px]" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">
                    计量单位 <span class="text-red-400">*</span>
                  </Label>
                  <Select v-model="form.unit">
                    <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                      <SelectValue placeholder="请选择单位" />
                    </SelectTrigger>
                    <SelectContent side="bottom" class="max-h-60 w-[var(--radix-select-trigger-width)]">
                      <SelectItem v-for="u in UNIT_OPTIONS" :key="u" :value="u">
                        {{ u }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">商品条码</Label>
                  <Input v-model="form.barcode" placeholder="如：6901234567890" class="h-12 rounded-xl text-[15px]" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">
                    品类 <span class="text-red-400">*</span>
                  </Label>
                  <Select v-model="form.categoryId">
                    <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                      <SelectValue placeholder="请选择品类" />
                    </SelectTrigger>
                    <SelectContent side="bottom" class="max-h-60 w-[var(--radix-select-trigger-width)]">
                      <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c.id" :value="c.id">
                        {{ c.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[15px] font-medium text-foreground/80">仓库</Label>
                  <Select v-model="form.warehouseId">
                    <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                      <SelectValue :placeholder="currentWarehouseName || '请选择仓库（非必填）'" />
                    </SelectTrigger>
                    <SelectContent side="bottom" class="max-h-60 w-[var(--radix-select-trigger-width)]">
                      <SelectItem v-for="w in warehouseOptions" :key="w.id" :value="w.id">
                        {{ w.warehouseName }}{{ w.isDefault === 1 ? '（默认）' : '' }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
            <div class="flex items-center gap-2.5">
              <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                <Warehouse class="w-3.5 h-3.5 text-[#1A2C54]" />
              </div>
              <h4 class="text-lg font-semibold text-[#1A2C54]">采购展示信息</h4>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">产地</Label>
                <Input v-model="form.originPlace" placeholder="如：山西晋中" class="h-12 rounded-xl text-[15px]" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">包装规格</Label>
                <Input v-model="form.packageSpec" placeholder="如：10盒/箱" class="h-12 rounded-xl text-[15px]" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">储存条件</Label>
                <Input v-model="form.storageCondition" placeholder="如：常温避光保存" class="h-12 rounded-xl text-[15px]" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">保质期</Label>
                <Input v-model="form.shelfLife" placeholder="如：12个月" class="h-12 rounded-xl text-[15px]" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">适用场景</Label>
                <Input v-model="form.applicableScene" placeholder="如：门店陈列、团购礼盒" class="h-12 rounded-xl text-[15px]" />
              </div>
              <div class="space-y-1.5">
                <Label class="text-[15px] font-medium text-foreground/80">售后说明</Label>
                <Input v-model="form.afterSaleNote" placeholder="如：破损包换、按平台规则售后" class="h-12 rounded-xl text-[15px]" />
              </div>
            </div>
          </section>

          <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
            <div class="flex items-center gap-2.5">
              <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                <Image class="w-3.5 h-3.5 text-[#1A2C54]" />
              </div>
              <h4 class="text-lg font-semibold text-[#1A2C54]">图片与描述</h4>
            </div>

            <div class="mt-6 space-y-5">
              <div>
                <Label class="text-[15px] font-medium text-foreground/80">商品图片 <span class="text-red-400">*</span></Label>
                <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="handleImageFiles" />
                <div class="mt-3 flex flex-wrap gap-3">
                  <div
                    v-for="(src, i) in imagePreviews"
                    :key="i"
                    class="relative h-24 w-24 overflow-hidden rounded-xl border border-border/60 group"
                  >
                    <img :src="src" class="h-full w-full object-cover" alt="" />
                    <button
                      type="button"
                      class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                      @click="removeImage(i)"
                    >
                      <Trash2 class="h-5 w-5 text-white" />
                    </button>
                  </div>
                  <button
                    type="button"
                    class="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#c5d5e8] bg-[#fafcfe] text-muted-foreground transition-colors hover:border-[#5b8def] hover:bg-[#f5f8fd]"
                    @click="triggerUpload"
                  >
                    <Upload class="h-5 w-5" />
                    <span class="text-[11px]">{{ uploadingImages ? '上传中...' : '上传图片' }}</span>
                  </button>
                </div>
                <p class="mt-2 text-xs text-muted-foreground">支持 jpg、png 格式，建议至少 1 张主图，单个文件不超过 5MB</p>
              </div>

              <div>
                <Label class="text-[15px] font-medium text-foreground/80">商品描述</Label>
                <textarea
                  v-model="form.description"
                  rows="7"
                  placeholder="产地、成分、特点、使用方式、售后说明等，门店采购页会展示这里的内容"
                  class="flex w-full rounded-xl border border-input bg-white px-4 py-3 text-[15px] placeholder:text-muted-foreground/60 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(26,44,84,0.2)] focus-visible:ring-offset-1 focus-visible:border-[#1A2C54] resize-none transition-shadow"
                />
              </div>
            </div>
          </section>
        </div>

        <div class="space-y-5">
          <section class="overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
            <div class="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h4 class="text-lg font-semibold text-[#1A2C54]">门店采购预览</h4>
                <p class="mt-1 text-xs text-muted-foreground">结构和门店商品详情页保持一致，左侧填什么，右侧就展示什么。</p>
              </div>
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">实时预览</span>
            </div>

            <div class="px-6 py-6">
              <StoreProductDetailShowcase
                :product-name="form.productName || '商品名称'"
                :images="previewImages"
                :current-image-idx="previewCurrentImageIdx"
                :category-label="currentCategoryName || '商品分类'"
                status-label="预览中"
                status-variant="muted"
                :description="previewDescription"
                price-text="待报价"
                :unit="form.unit"
                :min-order-qty="1"
                :show-actions="false"
                banner-tag="门店采购预览"
                :banner-title="form.productName || '商品名称'"
                :banner-text="previewDescription"
                :highlights="previewHighlights"
                :specs="previewSpecs"
                :detail-text="previewDetailText"
                :tips="previewTips"
                empty-image-text="请上传至少 1 张商品图片"
                @change-image="changePreviewImage"
                @select-image="setPreviewImage"
              />
            </div>
          </section>
           <section class="rounded-[20px] border border-border bg-white p-6 shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
            <h4 class="text-lg font-semibold text-[#1A2C54]">填写提醒</h4>
            <ul class="mt-4 space-y-2.5 text-sm text-foreground/70">
              <li class="flex items-start gap-2">
                <div class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A2C54]/30" />
                <span>商品名称、品类、单位、主图是门店采购页最先看到的内容。</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A2C54]/30" />
                <span>产地、包装规格、储存条件、保质期这些字段会直接进入商品详情。</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A2C54]/30" />
                <span>商品图片至少上传 1 张，便于后续审核和平台目录展示。</span>
              </li>
            </ul>
          </section>
        </div>
        <!-- </div> -->
      </div>

      <div class="mt-6 flex items-center justify-between rounded-[20px] border border-border bg-white px-6 py-5 shadow-[0_8px_32px_rgba(26,44,84,0.05)]">
        <button type="button" class="inline-flex items-center gap-1.5 h-11 px-6 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          取消
        </button>
        <button
          type="submit"
          :disabled="submitting || !formValid"
          class="inline-flex items-center gap-1.5 h-11 px-8 rounded-full text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: linear-gradient(135deg, #1A2C54 0%, #5B67D8 100%); box-shadow: 0 12px 24px rgba(91, 103, 216, 0.22);"
          @click="handleSubmit"
        >
          <div v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>{{ submitting ? '保存中...' : (isEdit ? '保存修改' : '创建商品') }}</span>
        </button>
      </div>
    </form>
  </PageWrapper>
</template>

<style scoped>
.brand-focus-input {
  border: 1.5px solid #e2e6ed;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.brand-focus-input:focus {
  border: 1.5px solid #1A2C54;
  box-shadow: 0 0 0 4px rgba(26, 44, 84, 0.08), 0 2px 8px rgba(26, 44, 84, 0.06);
}
.brand-focus-input:not(:disabled) {
  outline: none;
}
</style>

