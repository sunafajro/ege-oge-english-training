<template>
  <div class="row">
    <div class="col-12" v-if="running">
      <div :class="'alert ' + alertClass + ' text-center'">{{ time | timeFormat }}</div>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0 && currTaskNum === 1">
      <p>
        <b>Задание 1.</b>
        Суть задания.
      </p>
      <hr>
      <p>Текст.</p>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0 && currTaskNum === 2">
      <p>
        <b>Задание 2.</b>
        Суть задания.
      </p>
      <hr>
      <p>Текст.</p>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0 && currTaskNum === 3">
      <p>
        <b>Задание 3.</b>
        Суть задания
      </p>
      <hr>
      <p>Текст.</p>
    </div>
    <div class="col-12" v-if="examType === 'ege' && currSubTaskNum !== 0 && currTaskNum === 4">
      <p>
        <b>Задание 4.</b>
        Суть задания
      </p>
      <hr>
      <p>Текст.</p>
    </div>
    <div class="col-12" v-if="isFinished">
      <p>
        <b>Экзамен завершен!</b>
      </p>
      <p>Не забудьте скачать записи ваших ответов по ссылкам в нижней панели.</p>
      <button class="btn btn-success" @click="goToExamsList">Вернуться к списку экзаменов</button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { recordAudio } from "../recording";

export default {
  computed: {
    ...mapState(["audioUrls", "durations", "examType", "stream", "userName"]),
    alertClass() {
      return this.currSubTaskNum === 0
        ? "alert-info"
        : this.currSubTaskNum === 1
        ? "alert-warning"
        : "alert-success";
    },
    iterations() {
      const count = Object.keys(this.durations[this.examType]).length;
      return count * 2 + count - 1;
    },
    // продолжительность текущего интервала для задания
    currentInterval() {
      const subTaskNum = this.currSubTaskNum - 1;
      if (
        this.durations.hasOwnProperty(this.examType) &&
        this.durations[this.examType].hasOwnProperty(this.currTaskNum) &&
        this.durations[this.examType][this.currTaskNum].hasOwnProperty(
          subTaskNum
        )
      ) {
        return this.durations[this.examType][this.currTaskNum][subTaskNum];
      } else {
        return null;
      }
    },
    // номер текущего задания в экзамене
    currTaskNum() {
      return Math.ceil(this.step / 3);
    },
    currSubTaskNum() {
      return this.step % 3;
    },
    isFinished() {
      return (
        this.step === 3 * Object.keys(this.durations[this.examType]).length
      );
    }
  },
  async created() {
    this.start(this.durations.default);
  },
  data() {
    return {
      recorder: null,
      running: false,
      time: 0,
      timer: null,
      step: 0
    };
  },
  filters: {
    timeFormat(seconds) {
      const sec = seconds % 60;
      const min = seconds / 60 > 0 ? Math.floor(seconds / 60) : 0;
      return (min > 9 ? min : "0" + min) + ":" + (sec > 9 ? sec : "0" + sec);
    }
  },
  methods: {
    start(s) {
      if (s) {
        this.time = s;
      }
      this.running = true;
      if (!this.timer) {
        this.timer = setInterval(() => {
          if (this.time > 0) {
            this.time--;
          } else {
            //this.sound.play();
            this.stop();
          }
        }, 1000);
      }
    },
    async stop() {
      clearInterval(this.timer);
      this.time = 0;
      this.running = false;
      this.timer = null;
      this.step += 1;
      if (this.currSubTaskNum === 0) {
        if (this.recorder) {
          this.recorder.stop().then(({ audioUrl }) => {
            const id = this.currTaskNum;
            const audios = [...this.audioUrls];
            audios.push({
              id,
              filename:
                this.examType +
                ". Задание " +
                id +
                ". " +
                this.userName +
                ".wav",
              url: audioUrl
            });
            this.$store.commit("updateAudioUrls", audios);
            this.recorder = null;
          });
        }
        if (!this.isFinished) {
          this.start(this.durations.default);
        }
      } else {
        if (this.currSubTaskNum === 2 && this.stream) {
          this.recorder = await recordAudio(this.stream);
          this.recorder.start();
        }
        if (this.currentInterval) {
          this.start(this.currentInterval * 60);
        }
      }
    },
    goToExamsList() {
      this.$store.commit("updateAudioUrls", []);
      this.$router.push("/exams");
    }
  }
};
</script>
