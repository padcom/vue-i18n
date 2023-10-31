import { createApp } from 'vue'
import { i18n } from '@padcom/vue-i18n'

import App from './App.vue'

const messages = {
  en: {
    hello: 'Hello, world!',
  },
}

createApp(App)
  .use(i18n, { messages })
  .mount('#app')
