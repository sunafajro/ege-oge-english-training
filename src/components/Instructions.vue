<template>
  <div>
    <div class="row" style="margin-bottom: 1rem">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            Сейчас вы будете выполнять устную часть ГИА-11. Ваши ответы
            записываются. На экране вы видите время на подготовку (желтый
            таймер). При выполнении задания вы также имеет ограничение по
            времени (зеленый таймер).
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 text-center">
        <router-link class="btn btn-success" to="/exams">
          Все понятно
        </router-link>
      </div>
    </div>
    <div class="row" style="margin-top: 2rem">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            Для проверки микрофона и качества записи воспользуйтесь кнопками
            "Начать запись" и "ПРослушать запись".
            <div class="text-center" style="margin-top: 0.5rem">
              <button
                style="margin-right: 0.5rem"
                :class="recordButtonClass"
                @click="getRecord"
              >
                {{ !recording ? "Начать запись" : "Остановить запись" }}
              </button>
              <button
                class="btn btn-sm  btn-warning"
                :disabled="recording || !audio ? true : false"
                @click="playAudio"
              >
                Прослушать запись
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { recordAudio } from "../recording";

export default {
  computed: {
    ...mapState(["stream"]),
    recordButtonClass() {
      return "btn btn-sm " + (!this.recording ? "btn-primary" : "btn-danger");
    }
  },
  data() {
    return {
      audio: null,
      recorder: null,
      recording: false
    };
  },
  methods: {
    async getRecord() {
      if (this.stream) {
        if (this.recording) {
          this.recording = false;
          const { audioUrl } = await this.recorder.stop();
          this.audio = new Audio(audioUrl);
        } else {
          this.recording = true;
          this.recorder = await recordAudio(this.stream);
          this.recorder.start();
        }
      }
    },
    playAudio() {
      if (this.audio) {
        this.audio.play();
      }
    }
  }
};
</script>
