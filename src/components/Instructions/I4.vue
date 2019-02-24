<template>
  <div class="card" style="margin-bottom: 1rem">
    <div class="card-body text-center">
      <p class="instructions-text-title">Задание 3</p>
      <p
        class="instructions-text-description"
        v-if="examType === 'ege'"
      >Вам предлагается выбрать одну из трёх фотографий и описать её на основе плана.</p>
      <p
        class="instructions-text-description"
        v-if="examType === 'oge'"
      >Рассказать монолог по написанному плану.
        <br>Не забудьте про введение и заключение.
      </p>
      <p class="instructions-text-time-params">Подготовка: {{ durations[examType]['3'][0] }} мин</p>
      <p class="instructions-text-time-params">Выполнение: {{ durations[examType]['3'][1] }} мин</p>
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
