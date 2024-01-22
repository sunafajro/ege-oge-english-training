import { defineStore } from 'pinia';

export const useNotifyStore = defineStore('notify', {
  state: () => ({
    items: [],
    counter: 0,
  }),
  actions: {
    pushItem(item) {
      const counter = ++this.counter;
      item.id = counter;
      item.timerId = setInterval(() => this.removeItem(counter), 4000);
      const items = [...this.items];
      items.push(item);
      this.items = items;
    },
    removeItem(num) {
      const item = this.items.find((item) => item.id === num);
      clearInterval(item.timerId);
      const items = this.items.filter((item) => item.id !== num);
      this.items = items;
    },
  },
});
