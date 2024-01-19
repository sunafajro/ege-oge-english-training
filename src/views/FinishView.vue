<script setup>
import { useAuthStore } from '@/store/auth';
import { useExamStore } from '@/store/exam';

const authStore = useAuthStore();
const { logout } = authStore;
const examStore = useExamStore();
const { clear } = examStore;

function userLogout() {
  clear();
  logout();
}
</script>

<template>
  <div>
    <p>
      <b>Экзамен завершен!</b>
    </p>
    <p>Незабудьте скачать записи ваших ответов по ссылкам в нижней панели.</p>
    <button class="btn btn-success" @click="userLogout">
      Вернуться к списку экзаменов
    </button>
  </div>
</template>
