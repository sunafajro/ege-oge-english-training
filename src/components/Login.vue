<template>
  <div>
    <form @submit.prevent="login">
      <div class="form-group">
        <input
          class="form-control"
          placeholder="Ваш шифр..."
          type="text"
          v-model="userCode"
        />
      </div>
      <div class="form-group">
        <select class="form-control" v-model="examType">
          <option :value="null">-- тип экзамена --</option>
          <option value="oge">ОГЭ</option>
          <option value="ege">ЕГЭ</option>
        </select>
      </div>
      <div class="form-group text-center">
        <input type="submit" class="btn btn-primary" />
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  computed: {
    examType: {
      get() {
        return this.$store.state.examType;
      },
      set(value) {
        this.$store.commit("updateUserState", { examType: value });
      }
    },
    userCode: {
      get() {
        return this.$store.state.userCode;
      },
      set(value) {
        this.$store.commit("updateUserState", { userCode: value });
      }
    }
  },
  methods: {
    ...mapActions(["login"])
  }
};
</script>
