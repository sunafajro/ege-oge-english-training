/* global navigator */
import Vue from "vue";
import Vuex from "vuex";
import Noty from "noty";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    audioUrls: [],
    durations: {
      // seconds
      default: 5,
      // minutes
      ege: {
        1: [0.1, 0.1], // [1.5, 1.5],
        2: [0.1, 0.1], // [1.5, 1.7],
        3: [0.1, 0.1], // [1.5, 2.0],
        4: [0.1, 0.1] // [1.5, 2.0]
      },
      // minutes
      oge: {
        1: [0.1, 0.1], // [1.5, 2.0],
        2: [0.1, 0.1], // [0.9, 5.7],
        3: [0.1, 0.1], // [1.5, 2]
      }
    },
    examType: null,
    loggedIn: false,
    micAccess: null,
    step: 0,
    stream: null,
    userName: ""
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
      if (data.hasOwnProperty("userName")) {
        state.userName = data.userName;
      }
    }
  },
  actions: {
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
      if (state.userName && state.examType) {
        commit("updateUserState", { loggedIn: true });
      } else {
        dispatch("showNotification", {
          text: "Необходимо указать ваши ФИО и тип экзамена!",
          type: "error"
        });
      }
    },
    logout({ commit }) {
      commit("updateUserState", {
        examType: null,
        loggedIn: false,
        userName: ""
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
