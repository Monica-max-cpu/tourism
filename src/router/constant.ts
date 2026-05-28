export const PAGE_NOT_FOUND_NAME = 'PageNotFound';

export const EXCEPTION_COMPONENT = () => import('/@/views/exception/404.vue');

export const LAYOUT = () => import('/@/components/Layout/BasicLayout.vue');

export const getParentLayout = (_name?: string) => {
  return () =>
    new Promise((resolve) => {
      resolve({
        name: _name || 'ParentLayout',
      });
    });
};
