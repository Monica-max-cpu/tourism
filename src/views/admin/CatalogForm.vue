<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, Tag, Coins, Image, Upload, Plus, X, Info, Headphones, Trash2 } from 'lucide-vue-next'
import { Button, Card, CardContent, Input, Label } from '/@/components/ui'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui'
import { Switch } from '/@/components/ui'
import { PageWrapper } from '/@/components/PageWrapper'
import { ROUTE_PATHS } from '/@/constants/routePaths'
import { formatCurrency } from '/@/utils/format'
import type { PlatformCatalog, CatalogTier } from '/#/b2b'
import {
  listCatalogsApi, updateCatalogApi, addCatalogApi, listApprovedQuotesForSelectApi,
} from '/@/api/admin'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const catalogId = computed(() => (route.params.id as string) || '')
const pageTitle = computed(() => isEdit.value ? '编辑目录商品' : '新建目录商品')

const submitting = ref(false)
const loading = ref(false)
const productNameInput = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const imagePreviews = ref<string[]>([])

const form = reactive({
  productName: '',
  productImages: '',
  categoryId: '',
  unit: '',
  basePrice: 0,
  minOrderQty: 1,
  commissionRate: 0,
  preferredQuoteId: '',
  description: '',
  sortOrder: 1,
  shelfNow: true,
  catalogTiers: [] as CatalogTier[],
})

const formValid = computed(() => !!form.productName && !!form.unit && form.basePrice > 0)

interface QuoteOption { id: string; supplierId: string; supplierName: string; productName: string; unit?: string; costPrice?: number }
const quoteOptions = ref<QuoteOption[]>([])
const selectedQuote = computed(() => quoteOptions.value.find(q => q.id === form.preferredQuoteId))

const UNIT_OPTIONS = ['箱', '个', '斤', 'kg', '克', '升', '瓶', '袋', '盒', '件', '吨', '桶', '包', '罐']

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

const currentCategoryName = computed(() => CATEGORY_OPTIONS.find(c => c.id === form.categoryId)?.name || '')

function addTier() {
  const last = form.catalogTiers[form.catalogTiers.length - 1]
  const startQty = last ? (last.maxQty ?? last.minQty + 1) : form.minOrderQty
  form.catalogTiers.push({ minQty: startQty, maxQty: startQty + 49, unitPrice: form.basePrice })
}

function removeTier(index: number) {
  form.catalogTiers.splice(index, 1)
}

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
      form.productImages = JSON.stringify(imagePreviews.value)
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeImage(index: number) {
  imagePreviews.value.splice(index, 1)
  form.productImages = imagePreviews.value.length ? JSON.stringify(imagePreviews.value) : ''
}

async function loadQuoteOptions() {
  try {
    const list = await listApprovedQuotesForSelectApi()
    const raw: any[] = Array.isArray(list) ? list : (list as any)?.records ?? []
    quoteOptions.value = raw.map((item: any) => ({
      ...(item.quote || item),
      tiers: item.tiers,
      supplierName: item.quote?.supplierName || item.supplierName || '',
      productName: item.quote?.productName || item.productName || '',
      unit: item.quote?.unit || item.unit || '',
      costPrice: item.quote?.basePrice ?? item.basePrice ?? item.costPrice ?? 0,
    }))
  } catch { quoteOptions.value = [] }
}

async function loadCatalog() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const result: any = await listCatalogsApi({ pageNo: 1, pageSize: 200 })
    const catalog = result.records?.find((c: PlatformCatalog) => c.id === catalogId.value)
    if (catalog) {
      Object.assign(form, {
        productName: catalog.productName || '',
        productImages: catalog.productImages || '',
        categoryId: catalog.categoryId || '',
        unit: catalog.unit || '',
        basePrice: catalog.basePrice || 0,
        minOrderQty: catalog.minOrderQty ?? 1,
        commissionRate: catalog.commissionRate ?? 0,
        preferredQuoteId: catalog.preferredQuoteId || '',
        description: catalog.description || '',
        sortOrder: catalog.sortOrder ?? 1,
        shelfNow: catalog.status === 1,
        catalogTiers: catalog.catalogTiers ? [...catalog.catalogTiers] : [],
      })
      if (catalog.productImages) {
        try { imagePreviews.value = JSON.parse(catalog.productImages) } catch { imagePreviews.value = [catalog.productImages] }
      }
    }
  } finally { loading.value = false }
}

onMounted(async () => {
  await loadQuoteOptions()
  await loadCatalog()
  if (!isEdit.value) {
    await nextTick()
    productNameInput.value?.focus()
  }
})

async function handleSubmit() {
  if (!formValid.value) return
  submitting.value = true
  try {
    const payload = {
      productName: form.productName,
      productImages: form.productImages,
      categoryId: form.categoryId,
      unit: form.unit,
      basePrice: form.basePrice,
      minOrderQty: form.minOrderQty,
      commissionRate: form.commissionRate,
      preferredQuoteId: form.preferredQuoteId,
      description: form.description,
      sortOrder: form.sortOrder,
      catalogTiers: form.catalogTiers.length ? form.catalogTiers : undefined,
    }
    if (isEdit.value) {
      await updateCatalogApi(catalogId.value, payload)
    } else {
      await addCatalogApi(payload)
    }
    router.push(ROUTE_PATHS.ADMIN_CATALOGS)
  } finally { submitting.value = false }
}

function goBack() {
  router.push(ROUTE_PATHS.ADMIN_CATALOGS)
}
</script>

<template>
  <PageWrapper :title="pageTitle" subtitle="保存后立即生效，门店侧可见">
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回商品目录
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
            <!-- 顶部品牌装饰条 -->
            <div class="h-5 bg-[#1A2C54] rounded-t-[16px]" />

            <form @submit.prevent="handleSubmit">
              <div class="p-8 space-y-10">

                <!-- ===== 分区1：基础属性 ===== -->
                <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Package class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">基础属性</h4>
                </div>
                <div class="space-y-4">
                  <!-- 商品名称（聚焦态） -->
                  <div class="space-y-1.5">
                    <Label class="text-[15px] font-medium text-foreground/80">
                      商品名称 <span class="text-red-400">*</span>
                    </Label>
                    <input
                      ref="productNameInput"
                      v-model="form.productName"
                      type="text"
                      placeholder="如：山西老陈醋（特级）500ml×12"
                      class="brand-focus-input flex h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-[15px] placeholder:text-muted-foreground/60 outline-none transition-shadow"
                    />
                  </div>
                  <!-- 商品分类（灰底 Select） -->
                  <div class="space-y-1.5">
                    <Label class="text-[15px] font-medium text-foreground/80">商品分类</Label>
                    <Select v-model="form.categoryId">
                      <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                        <SelectValue :placeholder="currentCategoryName || '请选择商品分类'" />
                      </SelectTrigger>
                      <SelectContent side="bottom" class="w-[var(--radix-select-trigger-width)]">
                        <SelectItem v-for="c in CATEGORY_OPTIONS" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <!-- 销售单位 -->
                  <div class="space-y-1.5">
                    <Label class="text-[15px] font-medium text-foreground/80">
                      销售单位 <span class="text-red-400">*</span>
                    </Label>
                    <Select v-model="form.unit">
                      <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                        <SelectValue placeholder="请选择销售单位" />
                      </SelectTrigger>
                      <SelectContent side="bottom" class="w-[var(--radix-select-trigger-width)]">
                        <SelectItem v-for="u in UNIT_OPTIONS" :key="u" :value="u">{{ u }}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <!-- ===== 分区2：价格策略 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Coins class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">价格策略</h4>
                </div>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">
                        刊价（¥）<span class="text-red-400">*</span>
                      </Label>
                      <Input v-model.number="form.basePrice" type="number" min="0" step="0.01" placeholder="0.00" class="h-11 rounded-lg text-[15px]" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">最小起订量</Label>
                      <Input v-model.number="form.minOrderQty" type="number" min="1" placeholder="1" class="h-11 rounded-lg text-[15px]" />
                    </div>
                  </div>

                  <!-- 多档位阶梯价 -->
                  <div class="space-y-1.5">
                    <Label class="text-[15px] font-medium text-foreground/80">多档位阶梯价</Label>
                    <div class="rounded-xl border border-dashed border-[#d5dde5] bg-[#fafbfc] p-4">
                      <div v-if="form.catalogTiers.length === 0" class="text-xs text-muted-foreground text-center py-2">
                        暂未设置阶梯价，以刊价统一销售
                      </div>
                      <div v-else class="space-y-2 mb-3">
                        <div v-for="(t, i) in form.catalogTiers" :key="i" class="flex items-center gap-2">
                          <span class="text-xs text-muted-foreground shrink-0">档{{ i + 1 }}</span>
                          <Input v-model.number="t.minQty" type="number" min="1" placeholder="起" class="w-24 h-9 rounded-lg text-[15px]" />
                          <span class="text-xs text-muted-foreground">~</span>
                          <Input v-model.number="t.maxQty" type="number" min="1" placeholder="止" class="w-24 h-9 rounded-lg text-[15px]" />
                          <span class="text-xs text-muted-foreground shrink-0">¥</span>
                          <Input v-model.number="t.unitPrice" type="number" min="0" step="0.01" placeholder="单价" class="w-28 h-9 rounded-lg text-[15px]" />
                          <button type="button" class="shrink-0 p-1 rounded-full text-muted-foreground/40 hover:text-red-400 hover:bg-red-50 transition-colors" @click="removeTier(i)">
                            <X class="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button type="button" class="inline-flex items-center gap-1 text-[15px] font-medium text-[#5b8def] hover:text-[#4a7de0] transition-colors" @click="addTier">
                        <Plus class="w-3.5 h-3.5" />
                        添加阶梯
                      </button>
                    </div>
                  </div>

                  <!-- 优选报价 -->
                  <div class="space-y-1.5">
                    <Label class="text-[15px] font-medium text-foreground/80">优选报价</Label>
                    <Select v-model="form.preferredQuoteId">
                      <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                        <SelectValue placeholder="选择已生效的供应商报价" />
                      </SelectTrigger>
                      <SelectContent side="bottom" class="max-h-60 w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="">无（不关联报价）</SelectItem>
                        <SelectItem v-for="q in quoteOptions" :key="q.id" :value="q.id">
                          {{ q.supplierName }} · {{ q.productName }} · {{ formatCurrency(q.costPrice) }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p v-if="selectedQuote" class="text-xs text-muted-foreground">
                      供应商：{{ selectedQuote.supplierName }}&nbsp;&nbsp;|&nbsp;&nbsp;报价：¥{{ selectedQuote.costPrice }}
                    </p>
                    <p v-else-if="!quoteOptions.length" class="text-xs text-muted-foreground">
                      暂无已生效报价，请先在「供应商报价审核」中审核通过
                    </p>
                  </div>
                </div>
              </section>

              <!-- ===== 分区3：图片与描述 ===== -->
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
                      <!-- 云端上传区域 -->
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

              <!-- ===== 分区4：运营属性底条 ===== -->
              <div class="flex items-center gap-6 px-5 py-4 rounded-xl bg-[#f4f8fc]">
                <div class="flex items-center gap-2">
                  <Label class="text-[15px] font-medium text-foreground/70 shrink-0">展示排序</Label>
                  <Input v-model.number="form.sortOrder" type="number" min="0" class="w-20 h-9 rounded-lg text-[15px] text-center" />
                </div>
                <div class="flex items-center gap-2">
                  <Label class="text-[15px] font-medium text-foreground/70 shrink-0">服务费率</Label>
                  <Input v-model.number="form.commissionRate" type="number" min="0" step="0.01" placeholder="0" class="w-24 h-9 rounded-lg text-[15px] text-center" />
                  <span class="text-xs text-muted-foreground">%</span>
                </div>
                <div class="flex-1" />
                <div class="flex items-center gap-2.5">
                  <Label class="text-[15px] font-medium text-[#1A2C54]">立即上架</Label>
                  <Switch v-model:checked="form.shelfNow" class="data-[state=checked]:bg-[#1A2C54]" />
                </div>
              </div>

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
                <span>阶梯价默认可选，不填则以刊价统一销售</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>支持 jpg、png 多图上传，单个文件不超过 5MB</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>保存后可在列表页上架，门店即时可见</span>
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
/* 品牌聚焦输入框 —— 模拟 Focus 激活态的柔和光晕 */
.brand-focus-input {
  border: 1.5px solid #e2e6ed;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.brand-focus-input:focus {
  border: 1.5px solid #1A2C54;
  box-shadow: 0 0 0 4px rgba(26, 44, 84, 0.08), 0 2px 8px rgba(26, 44, 84, 0.06);
}
/* 新建时默认展示聚焦态 */
.brand-focus-input:not(:disabled) {
  outline: none;
}
</style>
