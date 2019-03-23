<template>
  <div id="app">
    <div class="alert alert-danger" v-if="!micAccess">
      Нет доступа к микрофону на вашем устройстве!
    </div>
    <div id="app" class="container-fluid">
      <div class="row header-title">
        <div class="col-12 text-center">
          <h3>Пробные тесты {{ headerName }} по английскому языку</h3>
        </div>
      </div>
      <div class="row">
        <div class="col-10 offset-1">
          <router-view />
        </div>
      </div>
    </div>
    <div class="bottom-panel" v-if="loggedIn">
      <div class="alert alert-info">
        <div class="row">
          <div class="col-6 text-left">
            <a
              class="btn btn-sm btn-info"
              style="margin-right: 0.5rem"
              :href="a.url"
              :download="a.filename"
              :key="'recording-' + a.id"
              v-for="a in audioUrls"
            >
              Запись {{ a.id }}
            </a>
          </div>
          <div class="col-6 text-right">
            {{ " " }}
            <b>{{ userCode }}</b>
            {{ " " }}
            <span class="logout-link" @click="logout">(Выйти)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  computed: {
    ...mapState(["audioUrls", "examType", "loggedIn", "micAccess", "userCode"]),
    headerName() {
      if (this.examType === "oge") {
        return "ОГЭ";
      } else if (this.examType === "ege") {
        return "ЕГЭ";
      } else {
        return "ОГЭ/ЕГЭ";
      }
    }
  },
  created() {
    if (!this.micAccess) {
      this.checkMicrofone();
    }
  },
  methods: {
    ...mapActions(["checkMicrofone", "logout", "showNotification"])
  }
};
</script>

<style>
.bottom-panel {
  position: fixed;
  bottom: 0;
  margin: 0;
  width: 100%;
}
.bottom-panel > .alert {
  margin: 0;
}
.header-title {
  margin: 1rem 0;
}
.logout-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>
