<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useMicStore } from '@/store/mic';
import { useExamStore } from '@/store/exam';
import { useNotifyStore } from '@/store/notify';
import { recordAudio, timeFormat } from '@/utils';
import ExamContentComponent from '@/components/ExamContentComponent.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { examType, userCode } = storeToRefs(authStore);
const micStore = useMicStore();
const { stream } = storeToRefs(micStore);
const examStore = useExamStore();
const { records, items, loading, loadedType, error } = storeToRefs(examStore);
const notifyStore = useNotifyStore();

const recorder = ref(null);
const running = ref(false);
const transitioning = ref(false);
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
      if (currentTask.value.audio) {
        text = '';
      }
      break;
  }
  return text;
});

const currentInterval = computed(() => {
  const { prepareTime, recordTime } = currentTask.value;
  switch (currSubTaskNum.value) {
    case 1:
      return prepareTime;
    case 2:
      return recordTime;
    default:
      return 5;
  }
});

const currentTask = computed(() => {
  const tasks = selectedTest.value?.tasks;
  return Array.isArray(tasks)
    ? (tasks.find((task) => task.id === currTaskNum.value) ?? {})
    : {};
});

const currTaskNum = computed(() => Math.ceil(step.value / 3));
const currSubTaskNum = computed(() => step.value % 3);
const isFinished = computed(() => {
  const tasks = selectedTest.value?.tasks;
  return (
    Array.isArray(tasks) && tasks.length > 0 && step.value >= 3 * tasks.length
  );
});

const selectedTest = computed(() => {
  return (
    items.value.find(
      (test) =>
        test.type === examType.value &&
        String(test.num) === String(route.params.id)
    ) ?? null
  );
});

const formattedTime = computed(() => {
  const { audio } = currentTask.value;
  let timeString = timeFormat(time.value);
  if ([2, 3].includes(currTaskNum.value) && audio) {
    if (currSubTaskNum.value !== 0) {
      timeString = '';
    }
  }
  if (currTaskNum.value === 2 && audio && currSubTaskNum.value === 2) {
    timeString = '';
  }
  return timeString;
});

function start(seconds) {
  if (seconds !== undefined && seconds !== null) {
    time.value = seconds;
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
  if (transitioning.value || !running.value) {
    return;
  }
  transitioning.value = true;
  clearInterval(timer.value);
  time.value = 0;
  running.value = false;
  timer.value = null;
  step.value += 1;
  try {
    if (currSubTaskNum.value === 0) {
      if (recorder.value) {
        const record = await recorder.value.stop();
        if (record) {
          const { audioUrl, extension } = record;
          const id = currTaskNum.value;
          records.value = [
            ...records.value,
            {
              id,
              filename: `${examType.value}._Задание_${id}._${userCode.value}.${extension}`,
              url: audioUrl,
            },
          ];
        }
        recorder.value = null;
      }
      if (!isFinished.value) {
        start(selectedTest.value.waitTime);
      }
    } else {
      if (currSubTaskNum.value === 2 && stream.value) {
        recorder.value = await recordAudio(stream.value);
        recorder.value.start();
      }
      if (currentInterval.value !== undefined) {
        start(currentInterval.value);
      }
    }
  } catch (e) {
    recorder.value = null;
    notifyStore.pushItem({
      message: 'Не удалось сохранить аудиозапись',
      type: 'danger',
    });
    if (!isFinished.value && currentInterval.value !== undefined) {
      start(currentInterval.value);
    }
  } finally {
    transitioning.value = false;
  }
}

async function loadAndStart() {
  if (loadedType.value !== examType.value) {
    await examStore.getItems({ examType: examType.value });
  }
  if (selectedTest.value && !running.value && step.value === 0) {
    start(selectedTest.value.waitTime);
  }
}

onMounted(loadAndStart);

onUnmounted(() => {
  clearInterval(timer.value);
  recorder.value?.cancel();
});

watch(isFinished, (value) => {
  if (value) {
    router.push('/finish');
  }
});
</script>

<template>
  <div class="row">
    <div class="col-12" v-if="loading">
      <div class="alert alert-info">Загрузка вариантов экзамена...</div>
    </div>
    <div class="col-12" v-else-if="error">
      <div class="alert alert-danger">{{ error }}</div>
      <button class="btn btn-primary" @click="loadAndStart">
        Попробовать снова
      </button>
    </div>
    <div class="col-12" v-else-if="!selectedTest">
      <div class="alert alert-warning">Вариант экзамена не найден.</div>
      <router-link class="btn btn-primary" to="/exams">
        К списку вариантов
      </router-link>
    </div>
    <template v-else>
      <div class="col-12" v-if="running">
        <div :class="`alert alert-${alertClass}`">
          <div class="row align-items-center">
            <div class="col-4 d-flex justify-content-start">
              {{ timerInfo }}
            </div>
            <div class="col-4 d-flex justify-content-center">
              <span>{{ formattedTime }}</span>
            </div>
            <div class="col-4 d-flex justify-content-end">
              <button
                @click="stop"
                :class="`btn btn-sm btn-${alertClass}`"
                :disabled="transitioning"
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
    </template>
  </div>
</template>
