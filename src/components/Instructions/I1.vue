<template>
  <div class="card" style="margin-bottom: 1rem">
    <div class="card-body text-center">
      <p
        style="font-size: 20px"
        v-if="examType === 'ege'"
      >Устная часть ЕГЭ по английскому языку включает в себя 4 задания.</p>
      <p
        style="font-size: 20px"
        v-if="examType === 'oge'"
      >Устная часть ОГЭ по иностранным языкам включает в себя 3 задания.</p>
      <p
        style="font-size: 20px"
      >Каждое следующее задание выдаётся после окончания ответа на предыдущее.</p>
      <p
        style="font-size: 20px"
      >Общее время ответа, включая время на подготовку и переходы между заданиями - не более 15 минут.</p>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["examType"])
  }
};
</script>
