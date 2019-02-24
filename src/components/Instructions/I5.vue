<template>
  <div class="card" style="margin-bottom: 1rem">
    <div class="card-body text-center">
      <p class="instructions-text-title">Задание 4</p>
      <p
        class="instructions-text-description"
      >Необходимо сравнить две фотографии на основе предложенного плана.</p>
      <p class="instructions-text-time-params">Подготовка: {{ durations[examType]['4'][0] }} мин</p>
      <p class="instructions-text-time-params">Выполнение: {{ durations[examType]['4'][1] }} мин</p>
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
