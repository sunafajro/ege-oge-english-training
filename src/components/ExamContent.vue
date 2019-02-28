<template>
  <div>
    <span class="task-description">
      <b>Task {{ task.id }}.</b> {{ task.title }}
    </span>
    <div v-if="task.images.length">
      <img
        :src="'/images/' + examType + '/' + exam + '/' + image"
        :key="'image-' + index"
        v-for="(image, index) in task.images"
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
    filteredQuestions() {
      if (this.task.sequentialQuestions) {
        return this.task.questions;
      } else {
        return this.task.questions;
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
</style>
