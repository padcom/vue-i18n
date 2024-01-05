import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
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
    rollupOptions: {
      external: ['vue'],
    }
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  },
})
