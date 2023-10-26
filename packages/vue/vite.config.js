import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

import i18n from '@padcom/vite-plugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    i18n(),
    dts({ rollupTypes: true, logLevel: 'warn' }),
  ],
  build: {
    lib: {
      entry: './index.ts',
      name: 'vue-i18n',
      formats: ['es', 'umd'],
      fileName: 'index',
    },
    sourcemap: true,
  },
})
