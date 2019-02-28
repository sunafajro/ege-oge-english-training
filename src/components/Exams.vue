<template>
  <div class="row">
    <div class="col-4">
      <router-link
        class="btn btn-info"
        :key="test.id"
        :to="'/exam/' + test.id"
        v-for="test in selectedTests"
      >
        Вариант {{ test.id }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["examType", "tests"]),
    selectedTests() {
      return this.tests.filter(test => test.type === this.examType);
    }
  }
};
</script>
