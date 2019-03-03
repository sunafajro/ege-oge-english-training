<template>
  <div>
    <span class="task-description">
      <b>Task {{ task.id }}. {{ task.title }}</b>
    </span>
    <div v-if="Array.isArray(filteredImages) && filteredImages.length">
      <img
        class="task-image img-thumbnail"
        :src="'/images/' + examType + '/' + exam + '/' + image"
        :key="'image-' + index"
        v-for="(image, index) in filteredImages"
        @click="selectImage(image)"
      />
    </div>
    <p>{{ task.description }}</p>
    <p v-if="selectedQuestion !== null">
      {{ time | timeFormat }}
    </p>
    <ul v-if="filteredQuestions.length">
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
  computed: {
    ...mapState(["examType"]),
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
    }
  },
  created() {
    if (this.task.sequentialQuestions) {
      this.start(this.task.prepareTime);
    }
  },
  data() {
    return {
      selectedQuestion: null,
      selectedImage: null,
      time: 0,
      timer: null
    };
  },
  filters: {
    timeFormat(seconds) {
      return timeFormat(seconds);
    }
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
      if (this.selectedQuestion === null) {
        this.selectedQuestion = 0;
        this.start(this.task.questionsInterval);
      } else if (this.selectedQuestion < this.task.questions.length - 1) {
        this.selectedQuestion += 1;
        this.start(this.task.questionsInterval);
      }
    }
  },
  props: {
    exam: {
      required: true,
      type: String
    },
    task: {
      required: true,
      type: Object
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
