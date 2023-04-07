import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { ipcRenderer } from "electron";
import "@/assets/main.scss";
import { createPinia } from "pinia";
import { ImageDirectory, useStore } from "@/store";

createApp(App).use(createPinia()).use(router).mount("#app");

const store = useStore();
window.addEventListener("unload", () => {
  localStorage.setItem("directorys", JSON.stringify(store.directorys.map(_ => _.path)));
  if (router.currentRoute.value.name === "images") localStorage.setItem("open-directory", decodeURI(router.currentRoute.value.query.path as string));
  else localStorage.removeItem("open-directory");
});
const directorys = localStorage.getItem("directorys");
if (directorys) store.directorys = (JSON.parse(directorys) as Array<string>).map(_ => new ImageDirectory(_));
const openDirectoryPath = localStorage.getItem("open-directory");
if (openDirectoryPath) router.push({
  name: "images",
  query: {
    path: openDirectoryPath
  }
});
router.beforeEach((to) => {
  if (to.name === "images")
    store.updateImageDirectory(to.query.path as string);
})

if (!process.env.IS_TEST)
  window.addEventListener("keydown", (event) => {
    if (event.key === "F12") {
      ipcRenderer.send("actionDevtools");
    }
  });
