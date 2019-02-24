import Vue from "vue";
import { mapState } from "vuex";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import "../node_modules/noty/lib/noty.css";
import "../node_modules/noty/lib/themes/bootstrap-v4.css";

Vue.config.productionTip = false;

new Vue({
  computed: {
    ...mapState(["loggedIn"])
  },
  created() {
    if (!this.loggedIn && this.$route.path !== "/login") {
      this.$router.push("/login");
    }
  },
  router,
  store,
  render: h => h(App),
  watch: {
    loggedIn(value) {
      if (!value && this.$route.path !== "/login") {
        this.$router.push("/login");
      }
      if (value && this.$route.path === "/login") {
        this.$router.push("/instructions");
      }
    }
  }
}).$mount("#app");
