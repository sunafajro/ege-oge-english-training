import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from '@/router';
import App from '@/App.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import LoginLayout from '@/layouts/LoginLayout.vue';
import '@/assets/scss/app.scss';

const pinia = createPinia();

const app = createApp(App);
app.component('LayoutDefault', DefaultLayout);
app.component('LayoutLogin', LoginLayout);
app.use(router);
app.use(pinia);
app.mount('#app');
