<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useMicStore } from '@/store/mic';

const micStore = useMicStore();
const { allowed } = storeToRefs(micStore);
const { check } = micStore;

onMounted(() => check());
</script>
<template>
  <div class="alert alert-danger m-0" v-if="!allowed">
    Нет доступа к микрофону на вашем устройстве!
  </div>
</template>
