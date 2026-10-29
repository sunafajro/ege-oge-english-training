<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useExamStore } from '@/store/exam';

const authStore = useAuthStore();
const { logout } = authStore;
const examStore = useExamStore();
const { records } = storeToRefs(examStore);
const { clear } = examStore;

function userLogout() {
  if (
    records.value.length &&
    !window.confirm('Выйти и удалить несохранённые записи ответов?')
  ) {
    return;
  }
  clear();
  logout();
}
</script>

<template>
  <div>
    <p>
      <b>Экзамен завершен!</b>
    </p>
    <p>Не забудьте скачать записи ваших ответов по ссылкам в нижней панели.</p>
    <button class="btn btn-success" @click="userLogout">
      Вернуться к списку экзаменов
    </button>
  </div>
</template>
