<script setup>
import { storeToRefs } from 'pinia';
import { useExamStore } from '@/store/exam';

const examStore = useExamStore();
const { items } = storeToRefs(examStore);
</script>

<template>
  <div>
    <router-link
      class="btn btn-info me-1 mb-1"
      :key="item.num"
      :to="`/exam/${item.num}`"
      v-for="item in items"
    >
      Вариант {{ item.num }}
    </router-link>
  </div>
</template>
