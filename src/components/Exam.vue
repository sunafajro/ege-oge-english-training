<template>
  <div class="row">
    <div class="col-12" v-if="running">
      <div :class="'alert ' + alertClass + ' text-center'">
        <span>{{ timerInfo }}</span>
        {{ time | timeFormat }}
      </div>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0">
      <e-content-component :exam="$route.params.id" :task="currentTask" />
    </div>
    <div class="col-12" v-if="isFinished">
      <p>
        <b>Экзамен завершен!</b>
      </p>
      <p>
        Незабудьте скачать записи ваших ответов по ссылкам в нижней панели.
      </p>
      <button class="btn btn-success" @click="goToExamsList">
        Вернуться к списку экзаменов
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import ExamContent from "./ExamContent.vue";
import { recordAudio, timeFormat } from "../utils";

export default {
  components: {
    "e-content-component": ExamContent
  },
  computed: {
    ...mapState(["audioUrls", "tests", "examType", "stream", "userCode"]),
    alertClass() {
      return this.currSubTaskNum === 0
        ? "alert-info"
        : this.currSubTaskNum === 1
        ? "alert-warning"
        : "alert-success";
    },
    timerInfo() {
      return this.currSubTaskNum === 0
        ? "Приготовьтесь!"
        : this.currSubTaskNum === 1
        ? "Время на подготовку"
        : "Идет запись";
    },
    iterations() {
      const count = this.selectedTest.tasks.length;
      return count * 2 + count - 1;
    },
    // продолжительность текущего интервала для задания
    currentInterval() {
      const subTaskNum = this.currSubTaskNum;
      if (this.currentTask) {
        switch (subTaskNum) {
          case 1:
            return this.currentTask.prepareTime;
          case 2:
            return this.currentTask.recordTime;
          default:
            return 5;
        }
      } else {
        return null;
      }
    },
    currentTask() {
      return this.selectedTest.tasks.reduce((a, task) => {
        if (task.id === this.currTaskNum) {
          a = task;
        }
        return a;
      }, {});
    },
    // номер текущего задания в экзамене
    currTaskNum() {
      return Math.ceil(this.step / 3);
    },
    currSubTaskNum() {
      return this.step % 3;
    },
    isFinished() {
      return this.step === 3 * this.selectedTest.tasks.length;
    },
    selectedTest() {
      const filtered = this.tests.filter(
        test =>
          test.type === this.examType &&
          String(test.id) === String(this.$route.params.id)
      );
      return Array.isArray(filtered) && filtered.length ? filtered[0] : {};
    }
  },
  async created() {
    this.start(this.selectedTest.waitTime);
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
      return timeFormat(seconds);
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
                this.userCode +
                ".wav",
              url: audioUrl
            });
            this.$store.commit("updateAudioUrls", audios);
            this.recorder = null;
          });
        }
        if (!this.isFinished) {
          this.start(this.selectedTest.waitTime);
        }
      } else {
        if (this.currSubTaskNum === 2 && this.stream) {
          this.recorder = await recordAudio(this.stream);
          this.recorder.start();
        }
        if (this.currentInterval) {
          this.start(this.currentInterval);
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
