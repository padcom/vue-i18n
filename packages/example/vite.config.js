import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import i18n from '@padcom/vite-plugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    i18n(),
  ],
  build: {
    sourcemap: true
  }
})
