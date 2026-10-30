<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useMicStore } from '@/store/mic';
import { useExamStore } from '@/store/exam';
import { useNotifyStore } from '@/store/notify';
import { playBeep, recordAudio, timeFormat } from '@/utils';
import ExamContentComponent from '@/components/ExamContentComponent.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { examType, userCode } = storeToRefs(authStore);
const micStore = useMicStore();
const { stream } = storeToRefs(micStore);
const examStore = useExamStore();
const { records, items, fileUrl, loading, loadedType, error } =
  storeToRefs(examStore);
const notifyStore = useNotifyStore();

const recorder = ref(null);
const questionAudio = ref(null);
const questionPlaying = ref(false);
const completionPlaying = ref(false);
const descriptionEnded = ref(false);
const questionIndex = ref(0);
const running = ref(false);
const transitioning = ref(false);
const time = ref(0);
const timer = ref(null);
const step = ref(0);

const selectedTest = computed(() => {
  return (
    items.value.find(
      (test) =>
        test.type === examType.value &&
        String(test.num) === String(route.params.id)
    ) ?? null
  );
});
const currTaskNum = computed(() => Math.ceil(step.value / 3));
const currSubTaskNum = computed(() => step.value % 3);
const currentTask = computed(() => {
  const tasks = selectedTest.value?.tasks;
  return Array.isArray(tasks)
    ? (tasks.find((task) => task.id === currTaskNum.value) ?? {})
    : {};
});
const hasSeparateQuestions = computed(() => {
  const { audio, questions, completionAudio } = currentTask.value;
  return (
    audio &&
    Array.isArray(questions) &&
    (questions.length > 1 || Boolean(completionAudio))
  );
});
const currentQuestion = computed(
  () => currentTask.value.questions?.[questionIndex.value] ?? null
);
const isFinished = computed(() => {
  const tasks = selectedTest.value?.tasks;
  return (
    Array.isArray(tasks) && tasks.length > 0 && step.value >= 3 * tasks.length
  );
});

const alertClass = computed(() => {
  if (
    questionPlaying.value ||
    completionPlaying.value ||
    currSubTaskNum.value === 0
  ) {
    return 'info';
  }
  return currSubTaskNum.value === 1 ? 'warning' : 'success';
});
const timerInfo = computed(() => {
  if (questionPlaying.value) {
    return `Вопрос ${questionIndex.value + 1} из ${currentTask.value.questions.length}`;
  }
  if (completionPlaying.value) {
    return 'Завершение задания';
  }
  if (currSubTaskNum.value === 0) {
    return 'Приготовьтесь!';
  }
  if (currSubTaskNum.value === 1) {
    return currentTask.value.audio ? '' : 'Время на подготовку';
  }
  return 'Идет запись';
});
const stopButtonText = computed(() => {
  if (hasSeparateQuestions.value && currSubTaskNum.value === 2) {
    return questionIndex.value < currentTask.value.questions.length - 1
      ? 'следующий ответ'
      : 'завершить ответ';
  }
  return 'закончить досрочно';
});
const currentInterval = computed(() => {
  const { prepareTime, recordTime, questionsInterval } = currentTask.value;
  switch (currSubTaskNum.value) {
    case 1:
      return prepareTime;
    case 2:
      return hasSeparateQuestions.value
        ? (questionsInterval ?? recordTime)
        : recordTime;
    default:
      return 5;
  }
});
const formattedTime = computed(() => {
  if (questionPlaying.value || completionPlaying.value) {
    return '';
  }
  const { audio } = currentTask.value;
  let timeString = timeFormat(time.value);
  if (
    !hasSeparateQuestions.value &&
    [2, 3].includes(currTaskNum.value) &&
    audio
  ) {
    if (currSubTaskNum.value !== 0) {
      timeString = '';
    }
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
        stop(true);
      }
    }, 1000);
  }
}

function clearTimer() {
  clearInterval(timer.value);
  time.value = 0;
  running.value = false;
  timer.value = null;
}

async function startRecording() {
  if (!questionPlaying.value) {
    return;
  }
  questionPlaying.value = false;
  questionAudio.value = null;
  playBeep(880);
  try {
    if (stream.value) {
      recorder.value = await recordAudio(stream.value);
      recorder.value.start();
    }
  } catch (e) {
    notifyStore.pushItem({
      message: 'Не удалось начать аудиозапись',
      type: 'danger',
    });
  }
  start(currentInterval.value);
}

function handleQuestionError() {
  if (!questionPlaying.value) {
    return;
  }
  notifyStore.pushItem({
    message: 'Не удалось воспроизвести вопрос',
    type: 'danger',
  });
  startRecording();
}

function handleDescriptionEnded() {
  descriptionEnded.value = true;
  if (
    hasSeparateQuestions.value &&
    [1, 2].includes(currSubTaskNum.value) &&
    !questionPlaying.value
  ) {
    if (currSubTaskNum.value === 1) {
      step.value += 1;
    }
    playCurrentQuestion();
  }
}

function playCurrentQuestion() {
  questionPlaying.value = true;
  const audio = new Audio(`${fileUrl.value}/${currentQuestion.value}`);
  questionAudio.value = audio;
  audio.addEventListener('ended', startRecording, { once: true });
  audio.addEventListener('error', handleQuestionError, { once: true });
  audio.play().catch(handleQuestionError);
}

async function saveRecord(questionId = null) {
  if (!recorder.value) {
    return;
  }
  const record = await recorder.value.stop();
  recorder.value = null;
  if (!record) {
    return;
  }
  const { audioUrl, extension } = record;
  const id = currTaskNum.value;
  const question = questionId ? `._Вопрос_${questionId}` : '';
  records.value = [
    ...records.value,
    {
      id,
      questionId,
      filename: `${examType.value}._Задание_${id}${question}._${userCode.value}.${extension}`,
      url: audioUrl,
    },
  ];
}

function finishSeparateTask() {
  completionPlaying.value = false;
  questionAudio.value = null;
  questionIndex.value = 0;
  step.value += 1;
  if (!isFinished.value) {
    start(selectedTest.value.waitTime);
  }
}

function handleCompletionError() {
  if (!completionPlaying.value) {
    return;
  }
  notifyStore.pushItem({
    message: 'Не удалось воспроизвести завершение задания',
    type: 'danger',
  });
  finishSeparateTask();
}

function playCompletion() {
  completionPlaying.value = true;
  const audio = new Audio(
    `${fileUrl.value}/${currentTask.value.completionAudio}`
  );
  questionAudio.value = audio;
  audio.addEventListener('ended', finishSeparateTask, { once: true });
  audio.addEventListener('error', handleCompletionError, { once: true });
  audio.play().catch(handleCompletionError);
}

async function stopSeparateQuestion(automatic) {
  if (automatic) {
    playBeep(440);
  }
  await saveRecord(questionIndex.value + 1);
  if (automatic) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  if (questionIndex.value < currentTask.value.questions.length - 1) {
    questionIndex.value += 1;
    playCurrentQuestion();
  } else if (currentTask.value.completionAudio) {
    playCompletion();
  } else {
    finishSeparateTask();
  }
}

async function stop(automatic = false) {
  if (transitioning.value || !running.value) {
    return;
  }
  transitioning.value = true;
  clearTimer();
  try {
    if (hasSeparateQuestions.value && currSubTaskNum.value === 2) {
      await stopSeparateQuestion(automatic);
    } else {
      step.value += 1;
      if (currSubTaskNum.value === 0) {
        await saveRecord();
        if (!isFinished.value) {
          start(selectedTest.value.waitTime);
        }
      } else {
        if (hasSeparateQuestions.value) {
          if (currSubTaskNum.value === 1) {
            descriptionEnded.value = false;
          } else if (descriptionEnded.value) {
            playCurrentQuestion();
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
  questionAudio.value?.pause();
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
      <div
        class="col-12"
        v-if="running || questionPlaying || completionPlaying"
      >
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
                @click="stop()"
                :class="`btn btn-sm btn-${alertClass}`"
                :disabled="transitioning"
                v-if="running && currSubTaskNum !== 0"
              >
                {{ stopButtonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12" v-if="currSubTaskNum !== 0">
        <ExamContentComponent
          :currSubTaskNum="currSubTaskNum"
          :task="currentTask"
          @description-ended="handleDescriptionEnded"
        />
      </div>
    </template>
  </div>
</template>
