import { defineStore } from "pinia";
import { ipcRenderer } from "electron";
import fs from "fs";
import path from "path";
import { shallowRef, triggerRef } from "vue";

export class ImageDirectory {
  path: string;
  dirname: string;
  isNormal: boolean = false;
  images: Array<string> = [];

  constructor(path: string) {
    this.path = path;
    const arr = this.path.split(/(\/|\\)/);
    this.dirname = arr[arr.length - 1];
    this.update();
  }

  update() {
    this.isNormal =
      fs.existsSync(this.path) && fs.statSync(this.path).isDirectory();
    if (this.isNormal) this.images = fs.readdirSync(this.path, { withFileTypes: true })
      .filter((e) => e.isFile() && /\.(jpg|jpeg|png|gif)$/.exec(e.name))
      .map((e) => `path://${path.resolve(this.path, e.name)}`);
    else this.images = [];
  }
}

export const useStore = defineStore("store", () => {
  const directorys = shallowRef<Array<ImageDirectory>>([]);

  async function addImageDirectory() {
    const path: string | undefined = await ipcRenderer.invoke("selectDirectory");
    if (!path || directorys.value.some((_) => _.path === path)) return;
    const dir = new ImageDirectory(path);
    directorys.value.push(dir);
    return dir;
  };

  function removeImageDirectory(directory: string) {
    directorys.value = directorys.value.filter((d) => d.path !== directory);
  }

  function updateImageDirectory(directory: string) {
    directorys.value.find(_ => _.path === directory)?.update();
    triggerRef(directorys);
  }
  return { directorys, addImageDirectory, removeImageDirectory, updateImageDirectory };
});
