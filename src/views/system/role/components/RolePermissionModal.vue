<script setup lang="ts">
import { ref } from 'vue';
import { message, Tree as ATree } from 'ant-design-vue';
import { BasicModal } from '/@/components/BasicModal';
import {
  queryRolePermissionApi,
  queryRolePermissionTreeApi,
  saveRolePermissionApi,
} from '/@/api/system/role';
import type { PermissionTreeNode } from '/#/system';

const visible = ref(false);
const loading = ref(false);
const roleId = ref('');
const checkedKeys = ref<string[]>([]);
const lastCheckedKeys = ref<string[]>([]);
const treeData = ref<PermissionTreeNode[]>([]);

function normalizeTree(nodes: PermissionTreeNode[]): PermissionTreeNode[] {
  return nodes.map((node) => ({
    ...node,
    title: node.title || node.slotTitle || '',
    children: node.children ? normalizeTree(node.children) : undefined,
  }));
}

async function open(id: string) {
  visible.value = true;
  loading.value = true;
  roleId.value = id;
  try {
    const [tree, current] = await Promise.all([
      queryRolePermissionTreeApi(),
      queryRolePermissionApi(id),
    ]);
    treeData.value = normalizeTree(tree.treeList || []);
    checkedKeys.value = current || [];
    lastCheckedKeys.value = current || [];
  } finally {
    loading.value = false;
  }
}

async function save() {
  loading.value = true;
  try {
    await saveRolePermissionApi(roleId.value, checkedKeys.value, lastCheckedKeys.value);
    message.success('角色权限已保存');
    visible.value = false;
  } finally {
    loading.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <BasicModal
    v-model:open="visible"
    title="角色权限配置"
    width="680px"
    :confirm-loading="loading"
    confirm-text="保存"
    @confirm="save"
  >
    <div class="max-h-[60vh] overflow-auto rounded-md border border-border p-3">
      <ATree
        v-model:checkedKeys="checkedKeys"
        checkable
        :tree-data="treeData"
        :field-names="{ title: 'title', key: 'key', children: 'children' }"
        default-expand-all
      />
    </div>
  </BasicModal>
</template>
