import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: './', // 修改一下相对路径，否则打包后electron无法识别到
  build: {
    outDir: 'electron/pages',
    // 打包的结果直接生成到 electron 的目录中去，这样electron 构建的时候，可以直接使用 index.html 了就
  },
})
