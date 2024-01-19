<script setup>
import TitleComponent from '@/components/TitleComponent.vue';
import MicAlertComponent from '@/components/MicAlertComponent.vue';
</script>

<template>
  <MicAlertComponent />
  <TitleComponent />
  <div class="container-fluid mt-3">
    <slot />
  </div>
</template>
