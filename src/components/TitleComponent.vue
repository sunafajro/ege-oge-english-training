<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const { examType } = storeToRefs(authStore);

const examName = computed(() => {
  switch (examType.value) {
    case 'oge':
      return 'ОГЭ';
    case 'ege':
      return 'ЕГЭ';
    default:
      return 'ОГЭ/ЕГЭ';
  }
});
</script>

<template>
  <div class="container-fluid mt-3">
    <div class="row header-title">
      <div class="col-12 text-center">
        <h3>Пробные тесты {{ examName }} по английскому языку</h3>
      </div>
    </div>
  </div>
</template>
