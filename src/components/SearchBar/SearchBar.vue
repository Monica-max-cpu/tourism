<script setup lang="ts">
/**
 * SearchBar - 通用筛选条
 * 顶部搜索框 + 状态 Select + 重置/查询按钮
 */
import { Search, RotateCcw } from 'lucide-vue-next';
import { Button } from '/@/components/ui';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
}>();
</script>

<template>
  <div class="rounded-lg p-4 mb-4">
    <div class="flex items-center gap-3 overflow-x-auto">
      <slot />
      <div class="flex items-center gap-2 ml-auto">
        <Button variant="outline" size="sm" :disabled="loading" @click="emit('reset')">
          <RotateCcw class="w-3.5 h-3.5 mr-1.5" />
          重置
        </Button>
        <Button size="sm" :disabled="loading" @click="emit('search')">
          <Search class="w-3.5 h-3.5 mr-1.5" />
          查询
        </Button>
      </div>
    </div>
  </div>
</template>
