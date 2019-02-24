<template>
  <div class="card" style="margin-bottom: 1rem">
    <div class="card-body text-center">
      <p class="instructions-text-title">Задание 2</p>
      <p class="instructions-text-description" v-if="examType === 'ege'">
        Вам предлагается ознакомиться с рекламным объявлением и
        задать пять вопросов на основе ключевых слов.
      </p>
      <p
        class="instructions-text-description"
        v-if="examType === 'oge'"
      >Ответить на вопросы электронного помощника в телефонном опросе.</p>
      <p class="instructions-text-time-params">Подготовка: {{ durations[examType]['2'][0] }} мин</p>
      <p class="instructions-text-time-params">Выполнение: {{ durations[examType]['2'][1] }} мин</p>
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
