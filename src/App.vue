<script setup>
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { isGuest } = storeToRefs(authStore);

const layout = computed(() => `layout-${route.meta.layout}`);

watch(isGuest, (value) => {
  if (value) {
    router.push('/login');
  }
});
</script>

<template>
  <component :is="layout">
    <div class="row">
      <div class="col-10 offset-1">
        <router-view />
      </div>
    </div>
  </component>
</template>
