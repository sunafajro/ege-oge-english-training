<template>
  <div class="row">
    <div class="col-4">
      <router-link
        class="btn btn-info ml-1 mb-1"
        :key="test.num"
        :to="'/exam/' + test.num"
        v-for="test in tests"
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
    ...mapState(["tests"])
  }
};
</script>
