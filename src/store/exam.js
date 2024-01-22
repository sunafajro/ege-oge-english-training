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
  }),
  actions: {
    async getItems({ examType }) {
      try {
        const url = `${this.itemsUrl}?type=${examType}`;
        const { data: tests } = await axios.get(url);
        this.items = tests;
      } catch (e) {
        this.items = [];
        const notifyStore = useNotifyStore();
        notifyStore.pushItem({
          message: 'Не удалось получить варианты тестов',
          type: 'danger',
        });
      }
    },
    clear() {
      this.records = [];
      this.items = [];
    },
  },
});
