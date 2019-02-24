import Vue from "vue";
import Router from "vue-router";
import Exam from "./components/Exam.vue";
import Exams from "./components/Exams.vue";
import Instructions from "./components/Instructions.vue";
import Login from "./components/Login.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/exam/:id",
      name: "exam",
      component: Exam
    },
    {
      path: "/exams",
      name: "exams",
      component: Exams
    },
    {
      path: "/instructions",
      name: "instructions",
      component: Instructions
    },
    {
      path: "/login",
      name: "login",
      component: Login
    }
  ]
});
