/**
 * useModal - 弹窗控制
 * const [openModal, closeModal, modalRef] = useModal();
 * openModal({ id: 1 }) → 打开并传入业务上下文
 */
import { ref } from 'vue';

export function useModal<T = any>() {
  const visible = ref(false);
  const data = ref<T | null>(null);
  const loading = ref(false);

  function open(payload?: T) {
    data.value = payload ?? null;
    visible.value = true;
  }
  function close() {
    visible.value = false;
    setTimeout(() => {
      data.value = null;
      loading.value = false;
    }, 200);
  }
  function setLoading(v: boolean) {
    loading.value = v;
  }

  return { visible, data, loading, open, close, setLoading };
}
