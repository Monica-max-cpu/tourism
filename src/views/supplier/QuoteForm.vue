<script setup lang="ts">
import { reactive, ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Package, Coins, Clock, Plus, X, Info, Headphones } from 'lucide-vue-next'
import { Button, Input, Label } from '/@/components/ui'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '/@/components/ui'
import { PageWrapper } from '/@/components/PageWrapper'
import { ROUTE_PATHS } from '/@/constants/routePaths'
import type { SupplierProduct, QuoteTier } from '/#/b2b-supplier'
import {
  listSupplierQuotesApi, createSupplierQuoteApi, updateSupplierQuoteApi, listSupplierProductsApi,
} from '/@/api/supplier/quote'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const quoteId = computed(() => (route.params.id as string) || '')
const pageTitle = computed(() => isEdit.value ? '编辑报价' : '新建报价')

const submitting = ref(false)
const loading = ref(false)
const productNameInput = ref<HTMLInputElement | null>(null)

const productOptions = ref<SupplierProduct[]>([])

const form = reactive({
  productId: '',
  productName: '',
  unit: '',
  basePrice: 0,
  minOrderQty: 10,
  leadTimeDays: 3,
  validFrom: '2026-05-24',
  validTo: '2026-12-31',
  currency: 'CNY',
  remark: '',
  tiers: [] as QuoteTier[],
})

const formValid = computed(() => !!form.productId && form.basePrice > 0 && !!form.validTo && form.minOrderQty > 0)

const CURRENCY_OPTIONS = [
  { value: 'CNY', label: 'CNY 人民币' },
  { value: 'USD', label: 'USD 美元' },
]

function addTier() {
  const last = form.tiers[form.tiers.length - 1]
  const startQty = last ? (last.maxQty ?? last.minQty + 1) : form.minOrderQty
  form.tiers.push({ minQty: startQty, maxQty: startQty + 49, unitPrice: form.basePrice })
}

function removeTier(index: number) {
  form.tiers.splice(index, 1)
}

function onProductChange(v: string) {
  const p = productOptions.value.find(x => x.id === v)
  if (p) {
    form.productId = p.id
    form.productName = p.productName
    form.unit = p.unit
  }
}

async function loadProductOptions() {
  try {
    const { records } = await listSupplierProductsApi({
      pageNo: 1, pageSize: 200, status: '1',
    })
    productOptions.value = records || []
  } catch { productOptions.value = [] }
}

async function loadQuote() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res: any = await listSupplierQuotesApi({ pageNo: 1, pageSize: 200 })
    const list = Array.isArray(res) ? res : (res.records || [])
    const record = list.find((item: any) => {
      const q = item.quote || item
      return (q.id || item.id) === quoteId.value
    })
    if (record) {
      const q = record.quote || record
      Object.assign(form, {
        productId: q.productId || '',
        productName: q.productName || '',
        unit: q.unit || '',
        basePrice: q.basePrice || q.costPrice || 0,
        minOrderQty: q.minOrderQty || q.minQty || 10,
        leadTimeDays: q.leadTimeDays ?? 3,
        validFrom: (q.validFrom || '').slice(0, 10),
        validTo: (q.validTo || '').slice(0, 10),
        currency: q.currency || 'CNY',
        remark: q.remark || '',
        tiers: (record.tiers || q.tiers || []).map((t: any) => ({
          minQty: t.minQty ?? t.minOrderQty ?? 0,
          maxQty: t.maxQty,
          unitPrice: t.unitPrice ?? t.price ?? 0,
        })),
      })
    }
  } finally { loading.value = false }
}

onMounted(async () => {
  await loadProductOptions()
  await loadQuote()
  if (!isEdit.value) {
    await nextTick()
    productNameInput.value?.focus()
  }
})

async function handleSubmit() {
  if (!formValid.value) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateSupplierQuoteApi(quoteId.value, {
        basePrice: form.basePrice, validFrom: form.validFrom + ' 00:00:00', validTo: form.validTo + ' 00:00:00',
        minOrderQty: form.minOrderQty, leadTimeDays: form.leadTimeDays,
        remark: form.remark, tiers: form.tiers.length ? form.tiers : undefined,
      } as any)
    } else {
      await createSupplierQuoteApi({
        productId: form.productId,
        minOrderQty: form.minOrderQty, basePrice: form.basePrice,
        validFrom: form.validFrom + ' 00:00:00', validTo: form.validTo + ' 00:00:00',
        currency: form.currency, leadTimeDays: form.leadTimeDays,
        remark: form.remark, tiers: form.tiers.length ? form.tiers : undefined,
      })
    }
    router.push(ROUTE_PATHS.SUPPLIER_QUOTES_MANAGE)
  } finally { submitting.value = false }
}

function goBack() {
  router.push(ROUTE_PATHS.SUPPLIER_QUOTES_MANAGE)
}
</script>

<template>
  <PageWrapper :title="pageTitle" subtitle="保存后将进入平台审核流程">
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回报价管理
      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载报价信息...</span>
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
                    <!-- 关联商品 -->
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">
                        关联商品 <span class="text-red-400">*</span>
                      </Label>
                      <Select :model-value="form.productId" :disabled="isEdit" @update:model-value="onProductChange">
                        <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                          <SelectValue :placeholder="form.productName || '请选择商品'" />
                        </SelectTrigger>
                        <SelectContent side="bottom" class="max-h-60 w-[var(--radix-select-trigger-width)]">
                          <SelectItem v-for="p in productOptions" :key="p.id" :value="p.id">
                            {{ p.productName }}（{{ p.unit || '-' }}）
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">
                          基础单价（{{ form.unit || '单位' }}）<span class="text-red-400">*</span>
                        </Label>
                        <Input v-model.number="form.basePrice" type="number" min="0" step="0.01" placeholder="0.00" class="h-11 rounded-lg text-[15px]" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">币种</Label>
                        <Select v-model="form.currency">
                          <SelectTrigger class="h-11 w-full rounded-lg bg-[#f8f9fb] border-[#e8ecf1] text-[#1A2C54] hover:bg-[#f3f5f8] transition-colors [&_svg]:text-[#1A2C54] [&_svg]:opacity-60">
                            <SelectValue placeholder="CNY" />
                          </SelectTrigger>
                          <SelectContent side="bottom" class="w-[var(--radix-select-trigger-width)]">
                            <SelectItem v-for="c in CURRENCY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">
                          最低起订量 <span class="text-red-400">*</span>
                        </Label>
                        <Input v-model.number="form.minOrderQty" type="number" min="1" placeholder="10" class="h-11 rounded-lg text-[15px]" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[15px] font-medium text-foreground/80">备货周期（天）</Label>
                        <Input v-model.number="form.leadTimeDays" type="number" min="0" placeholder="3" class="h-11 rounded-lg text-[15px]" />
                      </div>
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
                    <!-- 多档位阶梯价 -->
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">多档位阶梯价</Label>
                      <div class="rounded-xl border border-dashed border-[#d5dde5] bg-[#fafbfc] p-4">
                        <div v-if="form.tiers.length === 0" class="text-xs text-muted-foreground text-center py-2">
                          暂未设置阶梯价，以基础单价统一报价
                        </div>
                        <div v-else class="space-y-2 mb-3">
                          <div v-for="(t, i) in form.tiers" :key="i" class="flex items-center gap-2">
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
                        <button type="button" class="inline-flex items-center gap-1 text-[13px] font-medium text-[#5b8def] hover:text-[#4a7de0] transition-colors" @click="addTier">
                          <Plus class="w-3.5 h-3.5" />
                          添加阶梯
                        </button>
                      </div>
                    </div>

                    <!-- 备注 -->
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">备注</Label>
                      <Input v-model="form.remark" placeholder="量大可议、品质承诺等" class="h-11 rounded-lg text-[15px]" />
                    </div>
                  </div>
                </section>

                <!-- ===== 分区3：履约配置 ===== -->
                <section>
                  <div class="flex items-center gap-2.5 mb-5">
                    <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                      <Clock class="w-3.5 h-3.5 text-[#1A2C54]" />
                    </div>
                    <h4 class="text-lg font-semibold text-[#1A2C54]">履约配置</h4>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">生效日期</Label>
                      <Input v-model="form.validFrom" type="date" class="h-11 rounded-lg text-[15px]" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[15px] font-medium text-foreground/80">
                        有效期至 <span class="text-red-400">*</span>
                      </Label>
                      <Input v-model="form.validTo" type="date" class="h-11 rounded-lg text-[15px]" />
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
                  <span>{{ submitting ? '保存中...' : (isEdit ? '保存修改' : '创建报价') }}</span>
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
                <span>关联商品仅可选已启用状态的商品</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>阶梯价默认可选，不填则以基础单价统一报价</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>保存后进入待审核状态，由平台管理员审核</span>
              </li>
            </ul>
          </div>

          <div class="bg-[#1A2C54] text-white rounded-2xl p-5 overflow-hidden relative">
            <div class="relative z-10">
              <h4 class="font-bold mb-2">需要帮助？</h4>
              <p class="text-sm text-white/70 mb-3">
                如有报价疑问，请联系运营支持团队。
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
