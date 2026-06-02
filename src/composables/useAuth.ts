/**
 * useAuth - 角色与登录便捷入口
 */
import { storeToRefs } from 'pinia';
import { useUserStore } from '/@/stores/modules/user';

export function useAuth() {
  const userStore = useUserStore();
  const { user, token, isAdmin, isSupplier, isStore, isBasicUser, isLoggedIn } = storeToRefs(userStore);
  return {
    user,
    token,
    isAdmin,
    isSupplier,
    isStore,
    isBasicUser,
    isLoggedIn,
    login: userStore.login,
    logout: userStore.logout,
    fetchUserInfo: userStore.fetchUserInfo,
  };
}
