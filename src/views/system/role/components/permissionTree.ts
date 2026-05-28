import type { PermissionTreeNode } from '/#/system';

export function collectNodeKeys(node: PermissionTreeNode): string[] {
  const childKeys = node.children?.flatMap((child) => collectNodeKeys(child)) || [];
  return [node.key, ...childKeys];
}

export function mergeCheckedTreeKeys(currentKeys: string[], node: PermissionTreeNode, checked: boolean): string[] {
  const nodeKeys = collectNodeKeys(node);
  if (checked) {
    return [...new Set([...currentKeys, ...nodeKeys])];
  }
  const removeKeys = new Set(nodeKeys);
  return currentKeys.filter((key) => !removeKeys.has(key));
}

export function normalizeCheckedTreeKeys(tree: PermissionTreeNode[], checkedKeys: string[]): string[] {
  const result = new Set(checkedKeys);

  function walk(node: PermissionTreeNode): boolean {
    const selfChecked = result.has(node.key);
    const childChecked = node.children?.some((child) => walk(child)) || false;
    if (selfChecked || childChecked) {
      result.add(node.key);
      return true;
    }
    return false;
  }

  tree.forEach((node) => walk(node));
  return Array.from(result);
}
