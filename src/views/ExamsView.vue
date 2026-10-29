<script setup>
import { storeToRefs } from 'pinia';
import { useExamStore } from '@/store/exam';

const examStore = useExamStore();
const { items, loading, error } = storeToRefs(examStore);
</script>

<template>
  <div>
    <div class="alert alert-info" v-if="loading">
      Загрузка вариантов экзамена...
    </div>
    <div class="alert alert-danger" v-else-if="error">{{ error }}</div>
    <div class="alert alert-warning" v-else-if="!items.length">
      Нет доступных вариантов экзамена.
    </div>
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
