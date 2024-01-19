<script setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useExamStore } from '@/store/exam';

const authStore = useAuthStore();
const { userCode } = storeToRefs(authStore);
const { logout } = authStore;
const examStore = useExamStore();
const { records } = storeToRefs(examStore);
const { clear } = examStore;

function userLogout() {
  clear();
  logout();
}
</script>

<template>
  <div class="position-fixed m-0 w-100 bottom-0">
    <div class="alert alert-info m-0 d-flex justify-content-between">
      <div>
        <a
          class="btn btn-sm btn-info me-2"
          :href="a.url"
          :download="a.filename"
          :key="`recording-${a.id}`"
          v-for="a in records"
        >
          Запись {{ a.id }}
        </a>
      </div>
      <div>
        {{ ' ' }}
        <b>{{ userCode }}</b>
        {{ ' ' }}
        <a
          class="btn btn-sm btn-primary"
          href="javascript:void(0)"
          @click="userLogout"
          >Выход</a
        >
      </div>
    </div>
  </div>
</template>
