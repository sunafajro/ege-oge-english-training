<template>
  <div class="row">
    <div class="col-4">
      <router-link
        class="btn btn-info ml-1 mb-1"
        :key="test.num"
        :to="'/exam/' + test.num"
        v-for="test in selectedTests"
      >
        Вариант {{ test.num }}
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
