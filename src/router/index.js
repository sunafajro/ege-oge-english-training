import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import ExamView from '@/views/ExamView.vue';
import ExamsView from '@/views/ExamsView.vue';
import FinishView from '@/views/FinishView.vue';
import InstructionsView from '@/views/InstructionsView.vue';
import LoginView from '@/views/LoginView.vue';

const routes = [
  {
    path: '/exam/:id',
    name: 'exam',
    component: ExamView,
    meta: { layout: 'default', isPrivate: true },
  },
  {
    path: '/exams',
    name: 'exams',
    component: ExamsView,
    meta: { layout: 'default', isPrivate: true },
  },
  {
    path: '/finish',
    name: 'finish',
    component: FinishView,
    meta: { layout: 'default', isPrivate: true },
  },
  {
    path: '/instructions',
    name: 'instructions',
    component: InstructionsView,
    meta: { layout: 'default', isPrivate: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { layout: 'login', isPublic: true },
  },
  { path: '/', redirect: { name: 'instructions' } },
];

const router = new createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useAuthStore();
  if (to.matched.some((record) => record.meta.isPrivate)) {
    if (!store.isGuest) {
      next();
    } else {
      next({ name: 'login' });
    }
  } else if (to.matched.some((record) => record.meta.isPublic)) {
    if (!store.isGuest) {
      next({ name: 'instructions' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
