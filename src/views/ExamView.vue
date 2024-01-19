<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useMicStore } from '@/store/mic';
import { useExamStore } from '@/store/exam';
import { recordAudio, timeFormat } from '@/utils';
import ExamContentComponent from '@/components/ExamContentComponent.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { examType, userCode } = storeToRefs(authStore);
const micStore = useMicStore();
const { stream } = storeToRefs(micStore);
const examStore = useExamStore();
const { records, items } = storeToRefs(examStore);

const recorder = ref(null);
const running = ref(false);
const time = ref(0);
const timer = ref(null);
const step = ref(0);

const alertClass = computed(() =>
  currSubTaskNum.value === 0
    ? 'info'
    : currSubTaskNum.value === 1
      ? 'warning'
      : 'success'
);

const timerInfo = computed(() => {
  let text = 'Идет запись';
  switch (currSubTaskNum.value) {
    case 0:
      text = 'Приготовьтесь!';
      break;
    case 1:
      text = 'Время на подготовку';
      const { audio } = currentTask.value;
      if (audio) {
        text = '';
      }
      break;
  }
  return text;
});

// продолжительность текущего интервала для задания
const currentInterval = computed(() => {
  if (currentTask.value) {
    const { prepareTime, recordTime } = currentTask.value;
    switch (currSubTaskNum.value) {
      case 1:
        return prepareTime;
      case 2:
        return recordTime;
      default:
        return 5;
    }
  } else {
    return null;
  }
});

const currentTask = computed(() => {
  const { tasks } = selectedTest.value;
  return Array.isArray(tasks)
    ? tasks.reduce((a, task) => {
        if (task.id === currTaskNum.value) {
          a = task;
        }
        return a;
      }, {})
    : {};
});

// номер текущего задания в экзамене
const currTaskNum = computed(() => {
  return Math.ceil(step.value / 3);
});

const currSubTaskNum = computed(() => {
  return step.value % 3;
});

const isFinished = computed(() => {
  const { tasks } = selectedTest.value;
  return step.value === 3 * tasks.length;
});

const selectedTest = computed(() => {
  const filtered = items.value.filter(
    (test) =>
      test.type === examType.value &&
      String(test.num) === String(route.params.id)
  );
  return Array.isArray(filtered) && filtered.length ? filtered[0] : {};
});

const formattedTime = computed(() => {
  const { audio } = currentTask.value;
  let timeString = timeFormat(time.value);
  /*
   * Убираем таймер для заданий номер 2 и 3, тип аудио, шаги "подготовка", "запись"
   */
  if ([2, 3].indexOf(currTaskNum.value) !== -1 && audio) {
    if (currSubTaskNum.value !== 0) {
      timeString = '';
    }
  }
  /*
   * Убираем таймер для задания номер 2, тип без аудио, шаг "запись"
   */
  if (currTaskNum.value === 2 && audio) {
    if (currSubTaskNum.value === 2) {
      timeString = '';
    }
  }
  return timeString;
});

function start(s) {
  if (s) {
    time.value = s;
  }
  running.value = true;
  if (!timer.value) {
    timer.value = setInterval(() => {
      if (time.value > 0) {
        time.value--;
      } else {
        stop();
      }
    }, 1000);
  }
}

async function stop() {
  clearInterval(timer.value);
  time.value = 0;
  running.value = false;
  timer.value = null;
  step.value += 1;
  if (currSubTaskNum.value === 0) {
    if (recorder.value) {
      const { audioUrl } = await recorder.value.stop();
      const id = currTaskNum.value;
      const audios = [...records.value];
      audios.push({
        id,
        filename: `${examType.value}._Задание_${id}._${userCode.value}.wav`,
        url: audioUrl,
      });
      records.value = audios;
      recorder.value = null;
    }
    if (!isFinished.value) {
      const { waitTime } = selectedTest.value;
      start(waitTime);
    }
  } else {
    if (currSubTaskNum.value === 2 && stream.value) {
      recorder.value = await recordAudio(stream.value);
      recorder.value.start();
    }
    if (currentInterval.value) {
      start(currentInterval.value);
    }
  }
}

onMounted(() => {
  const { waitTime } = selectedTest.value;
  start(waitTime);
});

watch(isFinished, (value) => {
  if (value) {
    router.push('/finish');
  }
});
</script>

<template>
  <div class="row">
    <div class="col-12" v-if="running">
      <div :class="`alert alert-${alertClass}`">
        <div class="row align-items-center">
          <div class="col-4 d-flex justify-content-star">
            {{ timerInfo }}
          </div>
          <div class="col-4 d-flex justify-content-center">
            <span>
              {{ formattedTime }}
            </span>
          </div>
          <div class="col-4 d-flex justify-content-end">
            <button
              @click="stop"
              :class="`btn btn-sm btn-${alertClass}`"
              v-if="currSubTaskNum !== 0"
            >
              закончить досрочно
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12" v-if="currSubTaskNum !== 0">
      <ExamContentComponent
        :currSubTaskNum="currSubTaskNum"
        :task="currentTask"
      />
    </div>
  </div>
</template>
