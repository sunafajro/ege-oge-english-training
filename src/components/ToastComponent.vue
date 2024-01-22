<script setup>
import { onUpdated } from 'vue';
import { Toast } from 'bootstrap';
import { storeToRefs } from 'pinia';
import { useNotifyStore } from '@/store/notify';

const notifyStore = useNotifyStore();
const { items } = storeToRefs(notifyStore);

onUpdated(() => {
  items.value.forEach((item) => {
    const el = document.getElementById(`bs-toast-${item.id}`);
    if (el) {
      const toast = new Toast(el, {
        animation: true,
        autohide: true,
        delay: 3000,
      });
      toast.show();
    }
  });
});
</script>

<template>
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div
      :id="`bs-toast-${item.id}`"
      :class="`toast fade hide align-items-center text-bg-${item.type} border-0`"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      :key="item.id"
      v-for="item in items"
    >
      <div class="d-flex">
        <div class="toast-body">{{ item.message }}</div>
      </div>
    </div>
  </div>
</template>
