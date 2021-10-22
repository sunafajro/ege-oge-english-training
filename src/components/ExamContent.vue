<template>
  <div>
    <span class="task-description">
      <b>Task {{ task.id }}. {{ task.title }}</b>
    </span>
    <div
      style="display: flex"
      v-if="Array.isArray(filteredImages) && filteredImages.length"
    >
      <div :key="'image-' + index" v-for="(image, index) in filteredImages">
        <b style="vertical-align: top">
          {{ !selectedImage ? index + 1 : selectedImageId }}
        </b>
        <img
          class="task-image img-thumbnail"
          style="height: 210px"
          :src="examFilesUrl + '/' + image"
          @click="selectImage(image)"
        />
      </div>
    </div>
    <p>
      {{ !task.audio ? task.description : "" }}
    </p>
    <div
      style="margin-bottom: 0.5rem"
      v-if="
        !this.task.audio &&
          this.task.sequentialQuestions &&
          this.selectedQuestion !== null
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
        :key="'question-' + index"
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

<script>
import { mapState } from "vuex";
import { timeFormat } from "../utils";

export default {
  created() {
    //  && this.task.id === 2
    if (this.task.audio) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
      this.currentAudio = new Audio(
        `${this.examFilesUrl}/${this.task.description}`
      );
      this.currentAudio.play();
    }
  },
  destroyed() {
    //  && this.task.id === 2
    if (this.task.audio) {
      if (this.currentAudio) {
        this.currentAudio.pause();
      }
    }
  },
  computed: {
    ...mapState(["examFilesUrl", "examType"]),
    filteredImages() {
      return this.task.selectableImages && this.selectedImage
        ? this.task.images.filter(image => image === this.selectedImage)
        : this.task.images;
    },
    filteredQuestions() {
      if (this.task.sequentialQuestions && this.selectedQuestion !== null) {
        return this.task.questions.slice(
          this.selectedQuestion,
          this.selectedQuestion + 1
        );
      } else {
        return this.task.questions;
      }
    },
    selectedImageId() {
      let num = null;
      if (this.task.selectableImages && this.selectedImage) {
        if (this.selectedImage) {
          this.task.images.forEach((image, index) => {
            if (image === this.selectedImage) {
              num = index + 1;
            }
          });
        }
      }
      return num;
    },
    formattedTime() {
      return timeFormat(this.time);
    }
  },
  data() {
    return {
      currentAudio: null,
      selectedQuestion: null,
      selectedImage: null,
      taskEnded: false,
      time: 0,
      timer: null
    };
  },
  methods: {
    selectImage(name) {
      if (this.task.selectableImages) {
        this.selectedImage = name;
      }
    },
    start(s) {
      if (s) {
        this.time = s;
      }
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
    stop() {
      clearInterval(this.timer);
      this.time = 0;
      this.timer = null;
      if (this.selectedQuestion < this.task.questions.length - 1) {
        this.selectedQuestion += 1;
        this.start(this.task.questionsInterval);
      } else {
        this.selectedQuestion = null;
        this.taskEnded = true;
      }
    }
  },
  props: {
    exam: {
      required: true,
      type: String
    },
    currSubTaskNum: {
      required: true,
      type: Number
    },
    task: {
      required: true,
      type: Object
    }
  },
  watch: {
    currSubTaskNum(value) {
      if (this.task.sequentialQuestions && value === 2) {
        this.selectedQuestion = 0;
        this.start(this.task.questionsInterval);
      } else if (
        !this.task.sequentialQuestions &&
        value === 2 &&
        this.task.audio
      ) {
        if (this.currentAudio) {
          this.currentAudio.pause();
        }
        this.currentAudio = new Audio(
          `${this.examFilesUrl}/${this.task.questions[0]}`
        );
        this.currentAudio.play();
      }
    }
  }
};
</script>

<style>
.task-description {
  display: block;
  margin-bottom: 1rem;
}
.task-image {
  height: 250px;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  cursor: pointer;
}
</style>
