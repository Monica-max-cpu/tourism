<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, Image, Upload, Plus, X, Info, Headphones, Trash2 } from 'lucide-vue-next'
import { Button, Card, CardContent, Input, Label, Badge } from '/@/components/ui'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui'
import { PageWrapper } from '/@/components/PageWrapper'
import { saveSupplierProductApi, listSupplierProductsApi } from '/@/api/supplier/quote'
import { useUserStore } from '/@/stores/modules/user'
import { ROUTE_PATHS } from '/@/constants/routePaths'
import type { SupplierProduct } from '/#/b2b-supplier'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const supplierId = computed(() => userStore.getUserInfo?.supplierId || '')

const isEdit = computed(() => !!route.params.id)
const productId = computed(() => (route.params.id as string) || '')
const pageTitle = computed(() => isEdit.value ? '编辑商品' : '新建商品')
const pageDesc = computed(() => isEdit.value ? '修改商品档案信息，保存后自动生效' : '填写商品信息并提交至商品库')

const submitting = ref(false)
const loading = ref(false)
const productNameInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  productName: '',
  brand: '',
  spec: '',
  unit: '箱',
  barcode: '',
  categoryId: '',
  images: '',
  description: '',
})

const formValid = computed(() => !!form.productName && !!form.unit)

const CATEGORY_OPTIONS = [
  { id: 'cat_001', name: '生鲜' },
  { id: 'cat_002', name: '乳制品' },
  { id: 'cat_003', name: '调味料' },
  { id: 'cat_004', name: '饮品' },
  { id: 'cat_005', name: '海鲜' },
  { id: 'cat_006', name: '菌菇' },
  { id: 'cat_007', name: '水果' },
  { id: 'cat_008', name: '冻品' },
]
const UNIT_OPTIONS = ['箱', '个', '斤', 'kg', '克', '升', '瓶', '袋', '盒', '件', '吨', '桶', '包', '罐']

const currentCategoryName = computed(() => CATEGORY_OPTIONS.find(c => c.id === form.categoryId)?.name || '')

const fileInputRef = ref<HTMLInputElement | null>(null)
const imagePreviews = ref<string[]>([])

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleImageFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const reader = new FileReader()
    reader.onload = () => {
      imagePreviews.value.push(reader.result as string)
      form.images = JSON.stringify(imagePreviews.value)
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeImage(index: number) {
  imagePreviews.value.splice(index, 1)
  form.images = imagePreviews.value.length ? JSON.stringify(imagePreviews.value) : ''
}

async function loadProduct() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const result: any = await listSupplierProductsApi({ pageNo: 1, pageSize: 200, supplierId: supplierId.value })
    const product = result.records?.find((p: SupplierProduct) => p.id === productId.value)
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
      })
      if (product.images) {
        try { imagePreviews.value = JSON.parse(product.images) } catch { imagePreviews.value = [product.images] }
      }
    }
  } finally { loading.value = false }
}

onMounted(async () => {
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
      supplierId: supplierId.value,
      productName: form.productName,
      unit: form.unit,
      brand: form.brand,
      spec: form.spec,
      barcode: form.barcode,
      categoryId: form.categoryId,
      images: form.images,
      description: form.description,
    } as any)
    router.push(ROUTE_PATHS.SUPPLIER_PRODUCTS)
  } finally { submitting.value = false }
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
        返回商品库
      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载商品信息...</span>
    </div>

    <div v-else class="pt-4 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧：主卡片 占 2/3 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-[16px] overflow-hidden" style="box-shadow: 0 8px 32px rgba(26, 44, 84, 0.05);">
            <div class="h-5 bg-[#1A2C54] rounded-t-[16px]" />

            <form @submit.prevent="handleSubmit">
              <div class="p-8 space-y-10">

                <!-- ===== 分区1：基础信息 ===== -->
                <section>
                  <div class="flex items-center gap-2.5 mb-5">
                    <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                      <Package class="w-3.5 h-3.5 text-[#1A2C54]" />
                    </div>
                    <h4 class="text-lg font-semibold text-[#1A2C54]">基础信息</h4>
                  </div>
                  <div class="space-y-4">
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">
                        商品名称 <span class="text-red-400">*</span>
                      </Label>
                      <input
                        ref="productNameInput"
                        v-model="form.productName"
                        type="text"
                        placeholder="请输入商品名称"
                        class="brand-focus-input flex h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-[15px] placeholder:text-muted-foreground/60 outline-none transition-shadow"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">品牌</Label>
                        <Input v-model="form.brand" placeholder="如：水塔" class="h-11 rounded-lg text-[15px]" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">规格型号</Label>
                        <Input v-model="form.spec" placeholder="如：500ml×12瓶/箱" class="h-11 rounded-lg text-[15px]" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">
                          计量单位 <span class="text-red-400">*</span>
                        </Label>
                        <Select v-model="form.unit">
                          <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                            <SelectValue placeholder="请选择单位" />
                          </SelectTrigger>
                          <SelectContent side="bottom" :avoid-collisions="false" class="w-[var(--radix-select-trigger-width)]">
                            <SelectItem v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">商品条码</Label>
                        <Input v-model="form.barcode" placeholder="如：6901234567890" class="h-11 rounded-lg text-[15px]" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">品类</Label>
                        <Select v-model="form.categoryId">
                          <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                            <SelectValue :placeholder="currentCategoryName || '请选择品类'" />
                          </SelectTrigger>
                          <SelectContent side="bottom" :avoid-collisions="false" class="w-[var(--radix-select-trigger-width)]">
                            <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </section>

                <!-- ===== 分区2：图片与描述 ===== -->
                <section>
                  <div class="flex items-center gap-2.5 mb-5">
                    <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                      <Image class="w-3.5 h-3.5 text-[#1A2C54]" />
                    </div>
                    <h4 class="text-lg font-semibold text-[#1A2C54]">图片与描述</h4>
                  </div>
                  <div class="space-y-4">
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">商品图片</Label>
                      <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="handleImageFiles" />
                      <div class="flex flex-wrap gap-3">
                        <div
                          v-for="(src, i) in imagePreviews"
                          :key="i"
                          class="relative w-24 h-24 rounded-xl overflow-hidden border border-border/60 group"
                        >
                          <img :src="src" class="w-full h-full object-cover" alt="" />
                          <button
                            type="button"
                            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            @click="removeImage(i)"
                          >
                            <Trash2 class="w-5 h-5 text-white" />
                          </button>
                        </div>
                        <!-- 拖拽上传区域 -->
                        <div
                          class="w-50 h-50 rounded-xl border border-dashed border-[#c5d5e8] bg-[#fafcfe] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#5b8def] hover:bg-[#f5f8fd] transition-colors"
                          @click="triggerUpload"
                        >
                          <Upload class="w-10 h-10 text-[#b0c5dd]" />
                          <span class="text-[11px] text-muted-foreground">点击上传图片</span>
                        </div>
                        <!-- + 号添加入口 -->
                        <div
                          class="w-50 h-50 rounded-xl border-2 border-dashed border-[#c5d5e8] bg-[#fafcfe] flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-[#1A2C54] hover:bg-[#EFF6FF] transition-colors group/add"
                          @click="triggerUpload"
                        >
                          <Plus class="w-10 h-10 text-[#b0c5dd] group-hover/add:text-[#1A2C54] transition-colors" />
                          <span class="text-[11px] text-muted-foreground group-hover/add:text-[#1A2C54] transition-colors">添加</span>
                        </div>
                      </div>
                      <p class="text-xs text-muted-foreground">支持 jpg、png 格式，单个文件不超过 5MB</p>
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">商品描述</Label>
                      <textarea
                        v-model="form.description"
                        rows="6"
                        placeholder="产地、成分、特点等"
                        class="flex w-full rounded-lg border border-input bg-white px-3.5 py-2.5 text-[15px] placeholder:text-muted-foreground/60 outline-none focus-visible:ring-2 focus-visible:ring-[rgba(26,44,84,0.2)] focus-visible:ring-offset-1 focus-visible:border-[#1A2C54] resize-none transition-shadow"
                      />
                    </div>
                  </div>
                </section>

              </div>

              <!-- 底部操作按钮 -->
              <div class="flex items-center justify-between px-8 py-5 border-t border-border/40 bg-[#fafbfc]">
                <button type="button" class="inline-flex items-center gap-1.5 h-10 px-6 rounded-[20px] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors" @click="goBack">
                  <ArrowLeft class="w-4 h-4" />
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="submitting || !formValid"
                  class="inline-flex items-center gap-1.5 h-10 px-8 rounded-[20px] text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(135deg, #1A2C54 0%, #0f1d3a 100%); box-shadow: 0 2px 8px rgba(26, 44, 84, 0.25);"
                  @click="handleSubmit"
                >
                  <div v-if="submitting" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{{ submitting ? '保存中...' : (isEdit ? '保存修改' : '创建商品') }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 右侧：提示面板 -->
        <div class="space-y-5">
          <div class="bg-[#EFF6FF]/60 border border-[#EFF6FF] rounded-2xl p-5">
            <h4 class="font-bold text-[#1A2C54] mb-3 flex items-center gap-2">
              <Info class="w-4 h-4" />
              填写须知
            </h4>
            <ul class="space-y-2.5 text-sm text-foreground/70">
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>带 <span class="text-red-400">*</span> 标记的字段为必填项</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>商品创建后默认"启用"状态，可用于创建报价</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>如需下架商品，可在商品库列表操作"停用"</span>
              </li>
            </ul>
          </div>

          <div class="bg-[#1A2C54] text-white rounded-2xl p-5 overflow-hidden relative">
            <div class="relative z-10">
              <h4 class="font-bold mb-2">需要帮助？</h4>
              <p class="text-sm text-white/70 mb-3">
                如有商品录入疑问，请联系运营支持团队。
              </p>
              <div class="text-sm font-medium text-white/80">工作时间 9:00-18:00</div>
            </div>
            <div class="absolute -bottom-4 -right-4 opacity-10">
              <Headphones class="w-28 h-28" style="transform: rotate(-15deg)" />
            </div>
          </div>
        </div>

      </div>
    </div>
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
