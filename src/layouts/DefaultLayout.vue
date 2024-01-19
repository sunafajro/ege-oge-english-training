<script setup>
import TitleComponent from '@/components/TitleComponent.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import MicAlertComponent from '@/components/MicAlertComponent.vue';
</script>

<template>
  <MicAlertComponent />
  <TitleComponent />
  <div class="container-fluid mt-3">
    <slot />
  </div>
  <FooterComponent />
</template>
