import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    userCode: null,
    examType: null,
    isGuest: true,
  }),
  actions: {
    login({ userCode, examType }) {
      if (this.isGuest && userCode && examType) {
        this.userCode = userCode;
        this.examType = examType;
        this.isGuest = false;
      }
    },
    logout() {
      if (!this.isGuest) {
        this.userCode = null;
        this.examType = null;
        this.isGuest = true;
      }
    },
  },
});
