import { createApp } from 'vue'

import App from './App.vue'

import { i18n } from '.'

createApp(App)
  .use(i18n, {
    locale: 'de',
    messages: {
      en: {
        'Hello': 'Hello, world! from global keys',
      },
      pl: {
        Hello1: 'Witaj świecie! (global) - 1',
      },
   },
  })
  .mount('#app')
