import { defineStore } from 'pinia';
import axios from 'axios';
import { useNotifyStore } from '@/store/notify';

const el = document.getElementById('app');
const urls = JSON.parse(el.dataset.urls);

export const useExamStore = defineStore('exam', {
  state: () => ({
    records: [],
    items: [],
    fileUrl: urls.files ?? '',
    itemsUrl: urls.exams ?? '',
    error: null,
    loading: false,
    loadedType: null,
  }),
  actions: {
    async getItems({ examType }) {
      if (this.loading) {
        return false;
      }
      this.loading = true;
      this.error = null;
      try {
        const url = `${this.itemsUrl}?type=${examType}`;
        const { data: tests } = await axios.get(url);
        if (!Array.isArray(tests)) {
          throw new Error('Invalid exams response');
        }
        this.items = tests;
        this.loadedType = examType;
        return true;
      } catch (e) {
        this.items = [];
        this.loadedType = null;
        this.error = 'Не удалось получить варианты тестов';
        const notifyStore = useNotifyStore();
        notifyStore.pushItem({
          message: this.error,
          type: 'danger',
        });
        return false;
      } finally {
        this.loading = false;
      }
    },
    clear() {
      this.records.forEach(({ url }) => URL.revokeObjectURL(url));
      this.records = [];
      this.items = [];
      this.loadedType = null;
      this.error = null;
    },
  },
});
