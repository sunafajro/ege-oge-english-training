<script setup>
import { computed, onMounted, ref, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useExamStore } from '@/store/exam';
import { timeFormat } from '@/utils';

const props = defineProps({
  currSubTaskNum: {
    required: true,
    type: Number,
  },
  task: {
    required: true,
    type: Object,
  },
});

const examStore = useExamStore();
const { fileUrl } = storeToRefs(examStore);

const currentAudio = ref(null);
const selectedQuestion = ref(null);
const selectedImage = ref(null);
const taskEnded = ref(false);
const time = ref(0);
const timer = ref(null);

const currSubTaskNum = computed(() => props.currSubTaskNum);
const task = computed(() => props.task);

const filteredImages = computed(() => {
  const { images, selectableImages } = task.value;
  return selectableImages && selectedImage.value
    ? images.filter((image) => image === selectedImage.value)
    : images;
});

const filteredQuestions = computed(() => {
  const { questions, sequentialQuestions } = task.value;
  if (sequentialQuestions && selectedQuestion.value !== null) {
    return questions.slice(selectedQuestion.value, selectedQuestion.value + 1);
  } else {
    return questions;
  }
});

const selectedImageId = computed(() => {
  let num = null;
  const { images, selectableImages } = task.value;
  if (selectableImages && selectedImage.value) {
    if (selectedImage.value) {
      images.forEach((image, index) => {
        if (image === selectedImage.value) {
          num = index + 1;
        }
      });
    }
  }
  return num;
});

const formattedTime = computed(() => {
  return timeFormat(time.value);
});

function selectImage(name) {
  const { selectableImages } = task.value;
  if (selectableImages) {
    selectedImage.value = name;
  }
}
function start(s) {
  if (s) {
    time.value = s;
  }
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
function stop() {
  clearInterval(timer.value);
  time.value = 0;
  timer.value = null;
  const { questions, questionsInterval } = task.value;
  if (selectedQuestion.value < questions.length - 1) {
    selectedQuestion.value += 1;
    start(questionsInterval);
  } else {
    selectedQuestion.value = null;
    taskEnded.value = true;
  }
}

onMounted(() => {
  const { audio, description } = task.value;
  if (audio) {
    if (currentAudio.value) {
      currentAudio.value.pause();
    }
    currentAudio.value = new Audio(`${fileUrl.value}/${description}`);
    currentAudio.value.play();
  }
});

onUnmounted(() => {
  const { audio } = task.value;
  if (audio) {
    if (currentAudio.value) {
      currentAudio.value.pause();
    }
  }
});

watch(currSubTaskNum, (value) => {
  const { audio, questions, questionsInterval, sequentialQuestions } =
    task.value;
  if (sequentialQuestions && value === 2) {
    selectedQuestion.value = 0;
    start(questionsInterval);
  } else if (!sequentialQuestions && value === 2 && audio) {
    if (currentAudio.value) {
      currentAudio.value.pause();
    }
    currentAudio.value = new Audio(`${fileUrl.value}/${questions[0]}`);
    currentAudio.value.play();
  }
});
</script>

<template>
  <div>
    <span class="d-block mb-3">
      <b>Task {{ task.id }}. {{ task.title }}</b>
    </span>
    <div
      style="display: flex"
      v-if="Array.isArray(filteredImages) && filteredImages.length"
    >
      <div :key="`image-${index}`" v-for="(image, index) in filteredImages">
        <b style="vertical-align: top">
          {{ !selectedImage ? index + 1 : selectedImageId }}
        </b>
        <img
          class="mb-2 me-2 task-image img-thumbnail"
          style="height: 210px"
          :src="`${fileUrl}/${image}`"
          @click="selectImage(image)"
        />
      </div>
    </div>
    <p>
      {{ !task.audio ? task.description : '' }}
    </p>
    <div
      style="margin-bottom: 0.5rem"
      v-if="
        !task.audio && task.sequentialQuestions && selectedQuestion !== null
      "
    >
      <div
        class="btn btn-sm btn-success"
        style="margin-right: 0.5rem; width: 50px"
      >
        {{ formattedTime }}
      </div>
      <button class="btn btn-sm btn-success" @click="stop">
        следующий ответ
      </button>
    </div>
    <ul v-if="!task.audio && filteredQuestions.length && !taskEnded">
      <li
        :key="`question-${index}`"
        v-for="(question, index) in filteredQuestions"
      >
        {{ question }}
      </li>
    </ul>
    <p v-if="task.note">
      <i>{{ task.note }}</i>
    </p>
  </div>
</template>

<style>
.task-image {
  height: 250px;
  cursor: pointer;
}
</style>
