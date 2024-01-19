<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const { isGuest } = storeToRefs(authStore);
const { login } = authStore;

const userCode = ref(null);
const examType = ref(null);

watch(isGuest, (value) => {
  if (!value) {
    router.push('/');
  }
});

const validate = () => {
  return (
    userCode.value !== null &&
    userCode.value !== '' &&
    examType.value !== null &&
    examType.value !== ''
  );
};

const submit = () => {
  if (validate()) {
    login({ userCode: userCode.value, examType: examType.value });
  }
};
</script>

<template>
  <form @submit.prevent="submit">
    <div class="mb-3">
      <input
        class="form-control"
        placeholder="Ваш шифр..."
        type="text"
        v-model="userCode"
      />
    </div>
    <div class="mb-3">
      <select class="form-control" v-model="examType">
        <option :value="null">-- тип экзамена --</option>
        <option value="oge">ОГЭ</option>
        <option value="ege">ЕГЭ</option>
      </select>
    </div>
    <div class="mb-3 text-center">
      <button type="submit" class="btn btn-primary">Войти</button>
    </div>
  </form>
</template>
