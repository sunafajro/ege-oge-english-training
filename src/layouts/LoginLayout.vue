<script setup>
import { onUnmounted } from 'vue';
import TitleComponent from '@/components/TitleComponent.vue';
import MicAlertComponent from '@/components/MicAlertComponent.vue';
import ToastComponent from '@/components/ToastComponent.vue';
import { useMicStore } from '@/store/mic';

const micStore = useMicStore();
onUnmounted(() => micStore.release());
</script>

<template>
  <MicAlertComponent />
  <TitleComponent />
  <div class="container-fluid mt-3">
    <slot />
  </div>
  <ToastComponent />
</template>
