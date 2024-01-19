<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useMicStore } from '@/store/mic';
import { useExamStore } from '@/store/exam';

const authStore = useAuthStore();
const micStore = useMicStore();
const examStore = useExamStore();

const { examType } = storeToRefs(authStore);
const { allowed, stream } = storeToRefs(micStore);
const { getItems } = examStore;

const recording = ref(false);
const audio = ref(null);
const recorder = ref(null);
const examTypeNum = computed(() => (examType.value === 'oge' ? '9' : '11'));

onMounted(() => {
  getItems({ examType: examType.value });
});

async function createRecord() {
  if (stream.value !== null) {
    if (recording.value) {
      recording.value = false;
      const { audioUrl } = await recorder.value.stop();
      audio.value = new Audio(audioUrl);
    } else {
      recording.value = true;
      recorder.value = await recordAudio(stream.value);
      recorder.value.start();
    }
  }
}
function playRecord() {
  if (audio.value !== null) {
    audio.value.play();
  }
}
</script>

<template>
  <div>
    <div class="card mb-3">
      <div class="card-body">
        Сейчас вы будете выполнять устную часть ГИА-{{ examTypeNum }}. Ваши
        ответы записываются. На экране вы видите время на подготовку (желтый
        таймер). При выполнении задания вы также имеет ограничение по времени
        (зеленый таймер).
      </div>
    </div>
    <div class="mb-3 text-center">
      <router-link class="btn btn-success" to="/exams">
        Все понятно
      </router-link>
    </div>
    <div class="card mb-3">
      <div class="card-body">
        Для проверки микрофона и качества записи воспользуйтесь кнопками "Начать
        запись" и "Прослушать запись".
        <div class="text-center mt-2">
          <button
            style="margin-right: 0.5rem"
            :class="'btn btn-sm btn-' + (!recording ? 'primary' : 'danger')"
            :disabled="!allowed"
            @click="createRecord"
          >
            {{ !recording ? 'Начать запись' : 'Остановить запись' }}
          </button>
          <button
            class="btn btn-sm btn-warning"
            :disabled="recording || !audio"
            @click="playRecord"
          >
            Прослушать запись
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
