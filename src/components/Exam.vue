<template>
  <div class="row">
    <div class="col-12" v-if="running">
      <div :class="'alert alert-' + alertClass">
        <div class="row align-items-center">
          <div class="col-4 text-left">
            {{ timerInfo }}
          </div>
          <div class="col-4 text-center">
            <span>
              {{ formattedTime }}
            </span>
          </div>
          <div class="col-4 text-right">
            <button
              @click="stop"
              :class="'btn btn-sm btn-' + alertClass"
              v-if="this.currSubTaskNum !== 0"
            >
              закончить досрочно
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0">
      <e-content-component
        :exam="$route.params.id"
        :currSubTaskNum="currSubTaskNum"
        :task="currentTask"
      />
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
import { mapActions, mapState } from 'vuex';
import ExamContent from './ExamContent.vue';
import { recordAudio, timeFormat } from '../utils';

export default {
  components: {
    'e-content-component': ExamContent,
  },
  computed: {
    ...mapState(['audioUrls', 'tests', 'examType', 'stream', 'userCode']),
    alertClass() {
      return this.currSubTaskNum === 0
        ? 'info'
        : this.currSubTaskNum === 1
        ? 'warning'
        : 'success';
    },
    timerInfo() {
      let text = 'Идет запись';
      switch (this.currSubTaskNum) {
        case 0:
          text = 'Приготовьтесь!';
          break;
        case 1:
          text = 'Время на подготовку';
          if (this.currentTask.audio) {
            text = '';
          }
          break;
      }
      return text;
    },
    iterations() {
      const count = this.selectedTest.tasks.length;
      return count * 2 + count - 1;
    },
    // продолжительность текущего интервала для задания
    currentInterval() {
      if (this.currentTask) {
        switch (this.currSubTaskNum) {
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
      return Array.isArray(this.selectedTest.tasks)
        ? this.selectedTest.tasks.reduce((a, task) => {
            if (task.id === this.currTaskNum) {
              a = task;
            }
            return a;
          }, {})
        : {};
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
          String(test.num) === String(this.$route.params.id)
      );
      return Array.isArray(filtered) && filtered.length ? filtered[0] : {};
    },
    formattedTime() {
      let time = timeFormat(this.time);
      /*
       * Убираем таймер для заданий номер 2 и 3, тип аудио, шаги "подготовка", "запись"
       */
      if ([2, 3].indexOf(this.currTaskNum) !== -1 && this.currentTask.audio) {
        if (this.currSubTaskNum !== 0) {
          time = '';
        }
      }
      /*
       * Убираем таймер для задания номер 2, тип без аудио, шаг "запись"
       */
      if (this.currTaskNum === 2 && this.currentTask.audio) {
        if (this.currSubTaskNum === 2) {
          time = '';
        }
      }
      return time;
    },
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
      step: 0,
    };
  },
  methods: {
    ...mapActions(['logout']),
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
                '. Задание ' +
                id +
                '. ' +
                this.userCode +
                '.wav',
              url: audioUrl,
            });
            this.$store.commit('updateAudioUrls', audios);
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
      this.$store.commit('updateAudioUrls', []);
      this.logout();
    },
  },
};
</script>
