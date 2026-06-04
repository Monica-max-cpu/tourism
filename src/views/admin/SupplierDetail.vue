<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Building2, User, MapPin, Landmark, Store, ClipboardCheck, Info, Headphones } from 'lucide-vue-next'
import { Badge, Button, Label, Input } from '/@/components/ui'
import { PageWrapper } from '/@/components/PageWrapper'
import { BasicModal, useModal } from '/@/components/BasicModal'
import {
  getSupplierApplyApi,
  approveSupplierApplyApi,
  rejectSupplierApplyApi,
  toggleSupplierStatusApi,
} from '/@/api/admin'
import {
  AUTH_TYPE_LABEL,
  OPERATION_STATUS_LABEL,
  OPERATION_STATUS_VARIANT,
  REVIEW_STATUS_LABEL,
  REVIEW_STATUS_VARIANT,
  SUPPLIER_STORE_TYPE_LABEL,
  isOperationDisabled,
  isOperationEnabled,
  isPendingReview,
  isReviewApproved,
  normalizeOperationStatus,
  normalizeReviewStatus,
} from '/@/constants/b2bStatus'
import { formatDateTime } from '/@/utils/format'
import type { SupplierApply } from '/#/b2b'

const route = useRoute()
const router = useRouter()

const item = ref<SupplierApply | null>(null)
const loading = ref(true)
const submitting = ref(false)

const rejectModal = useModal<SupplierApply>()
const toggleModal = useModal<SupplierApply>()
const rejectReason = ref('')

async function load() {
  loading.value = true
  try {
    const id = route.params.id as string
    item.value = await getSupplierApplyApi(id)
  } finally {
    loading.value = false
  }
}
onMounted(load)

function goBack() { router.back() }

async function approve() {
  if (!item.value) return
  submitting.value = true
  try {
    await approveSupplierApplyApi(item.value.id)
    await load()
  } finally { submitting.value = false }
}

function openReject() {
  rejectReason.value = ''
  rejectModal.open(item.value!)
}

async function confirmReject() {
  if (!rejectReason.value.trim() || !item.value) return
  submitting.value = true
  try {
    await rejectSupplierApplyApi(item.value.id, rejectReason.value.trim())
    rejectModal.close()
    await load()
  } finally { submitting.value = false }
}

function openToggle() { toggleModal.open(item.value!) }

async function confirmToggle() {
  if (!item.value) return
  submitting.value = true
  try {
    const target = normalizeOperationStatus(item.value) === 1 ? 3 : 1
    await toggleSupplierStatusApi(item.value.id, target)
    toggleModal.close()
    await load()
  } finally { submitting.value = false }
}

</script>

<template>
  <PageWrapper :title="item ? `供应商入驻详情 - ${item.supplierName}` : '供应商入驻详情'" subtitle="">
    <template #extra>
      <Button variant="outline" class="text-muted-foreground" @click="goBack">
        <ArrowLeft class="w-4 h-4 mr-1.5" />
        返回列表
      </Button>
    </template>

    <div v-if="loading" class="flex items-center justify-center py-32">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-[#1A2C54] border-t-transparent" />
      <span class="ml-3 text-sm text-muted-foreground">加载中...</span>
    </div>

    <div v-else-if="!item" class="flex items-center justify-center py-32">
      <span class="text-sm text-muted-foreground">供应商不存在</span>
    </div>

    <div v-else class="pt-4 pb-16">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 左侧：主卡片 占 2/3 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-[16px] overflow-hidden" style="box-shadow: 0 8px 32px rgba(26, 44, 84, 0.05);">
            <!-- 顶部品牌装饰条 -->
            <div class="h-5 bg-[#1A2C54] rounded-t-[16px]" />

            <div class="p-8 space-y-10">

              <!-- ===== 状态头部 ===== -->
              <div class="flex flex-wrap items-center justify-between gap-4">
                <h2 class="text-xl font-bold text-[#1A2C54]">{{ item.supplierName }}</h2>
                <div class="flex items-center gap-2">
                  <Badge :variant="REVIEW_STATUS_VARIANT[normalizeReviewStatus(item)]">
                    {{ REVIEW_STATUS_LABEL[normalizeReviewStatus(item)] }}
                  </Badge>
                  <Badge :variant="OPERATION_STATUS_VARIANT[normalizeOperationStatus(item)]">
                    {{ OPERATION_STATUS_LABEL[normalizeOperationStatus(item)] }}
                  </Badge>
                </div>
              </div>

              <!-- ===== 分区1：基本信息 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Building2 class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">基本信息</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <!-- <div><span class="text-muted-foreground">供应商ID：</span><span class="font-medium">{{ item.id }}</span></div> -->
                  <div><span class="text-muted-foreground">供应商名称：</span><span class="font-medium">{{ item.supplierName }}</span></div>
                  <div><span class="text-muted-foreground">认证类型：</span><span class="font-medium">{{ AUTH_TYPE_LABEL[item.authType as keyof typeof AUTH_TYPE_LABEL] || item.authType || '-' }}</span></div>
                  <div><span class="text-muted-foreground">店铺类别：</span><span class="font-medium">{{ item.storeType ? SUPPLIER_STORE_TYPE_LABEL[item.storeType] : '-' }}</span></div>
                  <div><span class="text-muted-foreground">主营类别：</span><span class="font-medium">{{ item.mainCategory || '-' }}</span></div>
                  <!-- <div><span class="text-muted-foreground">经营品类：</span><span class="font-medium">{{ item.categoryIds || '-' }}</span></div> -->
                  <div><span class="text-muted-foreground">信用额度：</span><span class="font-medium">{{ item.creditLimit != null ? `¥${item.creditLimit}` : '-' }}</span></div>
                  <div><span class="text-muted-foreground">关联供应商来源：</span><span class="font-medium">{{ item.supplySourceId || '-' }}</span></div>
                </div>
              </section>

              <!-- ===== 分区2：联系人信息 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <User class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">联系人信息</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <div><span class="text-muted-foreground">联系人：</span><span class="font-medium">{{ item.contactPerson }}</span></div>
                  <div><span class="text-muted-foreground">联系电话：</span><span class="font-medium">{{ item.contactPhone }}</span></div>
                  <div><span class="text-muted-foreground">联系邮箱：</span><span class="font-medium">{{ item.contactEmail || '-' }}</span></div>
                </div>
              </section>

              <!-- ===== 分区3：地区与地址 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <MapPin class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">地区与地址</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <div><span class="text-muted-foreground">所在地：</span><span class="font-medium">{{ item.province }} {{ item.city }}</span></div>
                  <div><span class="text-muted-foreground">详细地址：</span><span class="font-medium">{{ item.address || '-' }}</span></div>
                  <!-- <div class="col-span-2"><span class="text-muted-foreground">地图地址：</span><span class="font-medium">{{ item.mapAddress || '-' }}</span></div> -->
                  <!-- <div class="col-span-2"><span class="text-muted-foreground">地图坐标：</span><span class="font-medium">{{ item.coordinate || '-' }}</span></div> -->
                </div>
              </section>

              <!-- ===== 分区4：银行信息 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Landmark class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">银行信息</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <div><span class="text-muted-foreground">开户行：</span><span class="font-medium">{{ item.bankName || '-' }}</span></div>
                  <div><span class="text-muted-foreground">银行账号：</span><span class="font-medium">{{ item.bankAccount || '-' }}</span></div>
                  <div><span class="text-muted-foreground">开户行号：</span><span class="font-medium">{{ item.bankNo || '-' }}</span></div>
                </div>
              </section>

              <!-- ===== 分区5：店铺信息 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <Store class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">店铺信息</h4>
                </div>
                <div class="grid grid-cols-1 gap-y-4 text-[15px]">
                  <div><span class="text-muted-foreground">Logo：</span><span class="font-medium">{{ item.logoId || '-' }}</span></div>
                  <div><span class="text-muted-foreground">店铺照片：</span><span class="font-medium">{{ item.storePhotos || '-' }}</span></div>
                  <div><span class="text-muted-foreground">经营简介：</span><span class="font-medium">{{ item.description || '-' }}</span></div>
                  <div><span class="text-muted-foreground">备注：</span><span class="font-medium">{{ item.remark || '-' }}</span></div>
                </div>
              </section>

              <!-- ===== 分区6：审核信息 ===== -->
              <section>
                <div class="flex items-center gap-2.5 mb-5">
                  <div class="w-6 h-6 flex items-center justify-center rounded-md bg-[#EFF6FF]">
                    <ClipboardCheck class="w-3.5 h-3.5 text-[#1A2C54]" />
                  </div>
                  <h4 class="text-lg font-semibold text-[#1A2C54]">审核信息</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-[15px]">
                  <div><span class="text-muted-foreground">提交时间：</span><span class="font-medium">{{ formatDateTime(item.createTime) }}</span></div>
                  <div v-if="item.reviewTime"><span class="text-muted-foreground">审核时间：</span><span class="font-medium">{{ formatDateTime(item.reviewTime) }}</span></div>
                  <div><span class="text-muted-foreground">登录账号：</span><span class="font-medium">{{ item.loginAccount || '-' }}</span></div>
                </div>
                <div v-if="item.reviewRemark" class="mt-4 text-[15px] p-4 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <span class="font-medium">驳回原因：</span>{{ item.reviewRemark }}
                </div>
              </section>

            </div>

            <!-- 底部操作按钮 -->
            <div class="flex items-center justify-end gap-3 px-8 py-5 border-t border-border/40 bg-[#fafbfc]">
              <template v-if="isPendingReview(normalizeReviewStatus(item))">
                <button
                  class="inline-flex items-center gap-1.5 h-10 px-6 rounded-[20px] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                  :disabled="submitting"
                  @click="openReject"
                >驳回</button>
                <button
                  class="inline-flex items-center gap-1.5 h-10 px-8 rounded-[20px] text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(135deg, #1A2C54 0%, #0f1d3a 100%); box-shadow: 0 2px 8px rgba(26, 44, 84, 0.25);"
                  :disabled="submitting"
                  @click="approve"
                >通过审核</button>
              </template>
              <template v-if="isReviewApproved(normalizeReviewStatus(item))">
                <button
                  v-if="isOperationEnabled(normalizeOperationStatus(item))"
                  class="inline-flex items-center gap-1.5 h-10 px-6 rounded-[20px] text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
                  :disabled="submitting"
                  @click="openToggle"
                >停用</button>
                <button
                  v-if="isOperationDisabled(normalizeOperationStatus(item))"
                  class="inline-flex items-center gap-1.5 h-10 px-8 rounded-[20px] text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style="background: linear-gradient(135deg, #1A2C54 0%, #0f1d3a 100%); box-shadow: 0 2px 8px rgba(26, 44, 84, 0.25);"
                  :disabled="submitting"
                  @click="openToggle"
                >启用</button>
              </template>
            </div>
          </div>
        </div>

        <!-- 右侧：提示面板 -->
        <div class="space-y-5">
          <div class="bg-[#EFF6FF]/60 border border-[#EFF6FF] rounded-2xl p-5">
            <h4 class="font-bold text-[#1A2C54] mb-3 flex items-center gap-2">
              <Info class="w-4 h-4" />
              审核说明
            </h4>
            <ul class="space-y-2.5 text-sm text-foreground/70">
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>审核通过后，供应商即可登录系统进行报价</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>驳回需填写原因，申请方可修改后重新提交</span>
              </li>
              <li class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-[#1A2C54]/30 mt-1.5 shrink-0" />
                <span>停用后供应商将无法接单，可随时重新启用</span>
              </li>
            </ul>
          </div>

          <div class="bg-[#1A2C54] text-white rounded-2xl p-5 overflow-hidden relative">
            <div class="relative z-10">
              <h4 class="font-bold mb-2">需要帮助？</h4>
              <p class="text-sm text-white/70 mb-3">
                如有审核疑问，请联系运营支持团队。
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

    <!-- 驳回弹窗 -->
    <BasicModal
      v-model:open="rejectModal.visible.value"
      title="驳回入驻申请"
      :description="`将驳回 ${rejectModal.data.value?.supplierName || ''} 的入驻申请`"
      confirm-text="确认驳回"
      confirm-variant="destructive"
      :confirm-loading="submitting"
      :confirm-disabled="!rejectReason.trim()"
      @confirm="confirmReject"
    >
      <div class="space-y-2">
        <Label>驳回原因 <span class="text-destructive">*</span></Label>
        <Input v-model="rejectReason" placeholder="请输入驳回原因" />
      </div>
    </BasicModal>

    <!-- 启用/停用确认弹窗 -->
    <BasicModal
      v-model:open="toggleModal.visible.value"
      :title="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '停用供应商' : '启用供应商'"
      :description="`确认${normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '停用' : '启用'} ${toggleModal.data.value?.supplierName || ''}？`"
      :confirm-text="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? '确认停用' : '确认启用'"
      :confirm-variant="normalizeOperationStatus(toggleModal.data.value || {}) === 1 ? 'destructive' : 'default'"
      :confirm-loading="submitting"
      @confirm="confirmToggle"
    />
  </PageWrapper>
</template>
