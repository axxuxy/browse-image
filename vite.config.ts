import { fileURLToPath, URL } from "url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { mainElectron, rendererElectron, onService } from "vite-plugin-electron";
import { dirname, resolve } from "path"


import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import IconsResolver from "unplugin-icons/resolver";
import Icons from "unplugin-icons/vite";
import { main } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    onService((url: string | undefined) => {
      process.env.DEV_URL = url;
    }),
    mainElectron({
      output: dirname(resolve(main)),
      main: {
        input: resolve(__dirname,"src/background.ts"),
        output: resolve(main)
      }
    }),
    rendererElectron({
      output: "renderer",
      useNode: true,
    }),
    AutoImport({
      imports: ["vue"],
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: "i",
        }),
      ],
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ["ep"],
        }),
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
