/* global navigator */
import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import Noty from "noty";

Vue.use(Vuex);

const el = document.getElementById("app");
const urls = JSON.parse(el.dataset.urls);

export default new Vuex.Store({
  state: {
    audioUrls: [],
    examFilesUrl: urls.files ? urls.files : "",
    examType: null,
    loggedIn: false,
    micAccess: null,
    step: 0,
    stream: null,
    tests: [],
    userCode: ""
  },
  getters: {
    getStep: state => {
      return ({ path, direction }) => {
        const currentIndex = state.steps.indexOf(path);
        if (direction === "next") {
          return state.steps[currentIndex + 1]
            ? state.steps[currentIndex + 1]
            : null;
        } else if (direction === "previous") {
          return state.steps[currentIndex - 1]
            ? state.steps[currentIndex - 1]
            : null;
        } else {
          return null;
        }
      };
    }
  },
  mutations: {
    updateTests(state, data) {
      state.tests = data;
    },
    updateAudioUrls(state, data) {
      state.audioUrls = data;
    },
    updateMicState(state, data) {
      state.micAccess = data.status;
      state.stream = data.stream;
    },
    updateUserState(state, data) {
      if (data.hasOwnProperty("loggedIn")) {
        state.loggedIn = data.loggedIn;
      }
      if (data.hasOwnProperty("examType")) {
        state.examType = data.examType;
      }
      if (data.hasOwnProperty("userCode")) {
        state.userCode = data.userCode;
      }
    }
  },
  actions: {
    async getTests({ commit, dispatch, state }, payload) {
      try {
        let examsUrl = urls.exams;
        if (payload) {
          examsUrl = `${examsUrl}?type=${state.examType}`;
        }
        const { data: tests } = await axios.get(examsUrl);
        commit("updateTests", tests);
      } catch (e) {
        dispatch("showNotification", {
          text: "Ошибка загрузки тестов! " + (e && e.message ? e.message : ""),
          type: "error"
        });
      }
    },
    async checkMicrofone({ commit, dispatch }) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        dispatch("showNotification", {
          text: "Микрофон доступен!",
          type: "success"
        });
        commit("updateMicState", { status: true, stream });
      } catch (e) {
        commit("updateMicState", { status: false, stream: null });
        dispatch("showNotification", {
          text: "Нет доступа к микрофону!",
          type: "error"
        });
      }
    },
    login({ commit, dispatch, state }) {
      if (state.userCode && state.examType) {
        commit("updateUserState", { loggedIn: true });
      } else {
        dispatch("showNotification", {
          text: "Необходимо указать ваш шифр и тип экзамена!",
          type: "error"
        });
      }
    },
    logout({ commit }) {
      commit("updateUserState", {
        examType: null,
        loggedIn: false,
        userCode: ""
      });
    },
    showNotification(args, payload) {
      new Noty({
        theme: "bootstrap-v4",
        text: payload.text,
        timeout: 2000,
        type: payload.type
      }).show();
    }
  }
});
