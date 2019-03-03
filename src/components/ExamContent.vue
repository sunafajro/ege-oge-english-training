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
export default {
  computed: {
    ...mapState(["examType"]),
    filteredImages() {
      return this.task.selectableImages && this.selectedImage
        ? this.task.images.filter(image => image === this.selectedImage)
        : this.task.images;
    },
    filteredQuestions() {
      if (this.task.sequentialQuestions) {
        return this.task.questions;
      } else {
        return this.task.questions;
      }
    }
  },
  data() {
    return {
      selectedImage: null
    };
  },
  methods: {
    selectImage(name) {
      if (this.task.selectableImages) {
        this.selectedImage = name;
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
