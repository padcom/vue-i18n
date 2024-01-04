import { createApp } from 'vue'
import { i18n } from '@padcom/vue-i18n'

import App from './App.vue'

const messages = {
  en: {
    greeting: 'Some greeting',
    hello: {
      message: 'Hello, world!',
    },
  },
}

createApp(App)
  .use(i18n, { messages })
  .mount('#app')
