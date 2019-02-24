<template>
  <div class="card" style="margin-bottom: 1rem">
    <div class="card-body text-center">
      <p class="instructions-text-title">Задание 1</p>
      <p class="instructions-text-description">Прочитать текст научно-популярного характера.</p>
      <p class="instructions-text-time-params">Подготовка: {{ durations[examType]['1'][0] }} мин</p>
      <p class="instructions-text-time-params">Выполнение: {{ durations[examType]['1'][1] }} мин</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["durations", "examType"])
  }
};
</script>
