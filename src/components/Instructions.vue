<template>
  <div>
    <div class="row">
      <div class="col-12">
        <c-intro-1/>
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <c-intro-2/>
      </div>
      <div class="col-6">
        <c-intro-3/>
      </div>
    </div>
    <div class="row">
      <div :class="examType === 'ege' ? 'col-6' : 'col-12'">
        <c-intro-4/>
      </div>
      <div class="col-6" v-if="examType === 'ege'">
        <c-intro-5/>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center">
        <router-link class="btn btn-success" to="/exams">Все понятно</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import I1 from "./Instructions/I1.vue";
import I2 from "./Instructions/I2.vue";
import I3 from "./Instructions/I3.vue";
import I4 from "./Instructions/I4.vue";
import I5 from "./Instructions/I5.vue";

export default {
  components: {
    "c-intro-1": I1,
    "c-intro-2": I2,
    "c-intro-3": I3,
    "c-intro-4": I4,
    "c-intro-5": I5
  },
  computed: {
    ...mapState(["examType"])
  }
};
</script>

<style>
.instructions-text-title {
  font-size: 24px;
  margin-bottom: 0.5rem;
}
.instructions-text-description {
  font-size: 20px;
  margin-bottom: 0.5rem;
}
.instructions-text-time-params {
  font-size: 18px;
  margin-bottom: 0.5rem;
}
</style>