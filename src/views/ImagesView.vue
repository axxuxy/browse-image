<template>
  <el-alert p v-if="!imageDirectoty" title="资源不存在" type="error" effect="light" show-icon :closable="false">
  </el-alert>
  <el-alert p v-else-if="!imageDirectoty.isNormal" title="地址不是目录或目录不存在" type="error" effect="light" show-icon
    :closable="false">
  </el-alert>
  <template v-else>
    <transition name="el-fade-in-linear">
      <div class="images-box" key="images-box">
        <el-scrollbar>
          <ul>
            <li v-for="(image, index) in images!" :key="image">
              <el-popover trigger="contextmenu" popper-class="context-menu-popover">
                <template #reference>
                  <el-image class="image" :src="image" fit="fill" loading="lazy" @click="selectShowImage"
                    :preview-src-list="imageDirectoty!.images" :initial-index="index" close-on-press-escape
                    preview-teleported @close="closeShowImage"></el-image>
                </template>
                <el-button @click="slideShow(image)">幻灯片播放</el-button>
              </el-popover>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </transition>
    <transition name="el-zoom-in-bottom">
      <browse-images-view v-if="images && browseImageIndex !== undefined" :images="images!" :index="browseImageIndex"
        @close="browseImageIndex = undefined"></browse-images-view>
    </transition>
  </template>
</template>

<script lang="ts" setup name="mage">
import { computed, ref } from "vue";
import BrowseImagesView from "@/views/BrowseImageView.vue";
import { ipcRenderer } from "electron";
import { useStore } from "@/store";

const props = defineProps<{
  path: string,
}>();

const store = useStore();
const path = computed(() => decodeURI(props.path));

const imageDirectoty = computed(() => {
  for (const directoty of store.directorys)
    if (directoty.path === path.value) return directoty;
  return null;
});

const images = computed(() => imageDirectoty?.value?.images);

function selectShowImage() {
  ipcRenderer.send("fullScreen");
}

function closeShowImage() {
  ipcRenderer.send("hideFullScreen");
}

function slideShow(image: string) {
  const index = imageDirectoty.value?.images.indexOf(image);
  if (index !== undefined && index >= 0) browseImageIndex.value = index;
  document.body.click();
}

const browseImageIndex = ref<number>();
</script>

<style scoped lang="scss">
.images-box {
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, auto));
    gap: 8px;
    margin: 0;
    padding: 12px;

    li {
      list-style: none;
      display: flex;
      align-items: center;
      margin: auto;
      width: 120px;
      height: 180px;

      .image {
        cursor: pointer;
      }
    }
  }
}
</style>
