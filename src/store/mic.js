import { defineStore } from 'pinia';

export const useMicStore = defineStore('mic', {
  state: () => ({
    stream: null,
    allowed: false,
  }),
  actions: {
    async check() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.allowed = true;
        this.stream = stream;
      } catch (e) {
        this.allowed = false;
        this.stream = null;
      }
    },
  },
});
