<template>
  <el-container class="browse-images-box">
    <el-alert class="not-image-tip" v-if="!props.images.length" title="没有发现任何图片" type="info" effect="light" show-icon
      closable></el-alert>
    <template v-else>
      <transition name="browse-image">
        <keep-alive>
          <el-image class="show-image" :key="showImage" :src="showImage" fit="contain" loading="lazy"
            @click.stop="next(true)" @contextmenu="openMenu = true">
            <template #placeholder>
              <div></div>
            </template>
          </el-image>
        </keep-alive>
      </transition>
      <img :src="nextImage" class="next-image" />
    </template>
    <transition name="el-fade-in">
      <div class="menu" @click="openMenu = false" v-show="openMenu">
        <span class="menu-item close" size="large" @click.stop="closeBrowseImages">
          <el-icon :size="24" color="#fff">
            <i-ep-close />
          </el-icon>
        </span>
        <span class="menu-item setting" size="large" @click.stop="showSetting = true">
          <el-icon :size="24" color="#fff">
            <i-ep-setting />
          </el-icon>
        </span>
      </div>
    </transition>
    <el-dialog title="设置播放间隔" v-model="showSetting" width="30%">
      <el-form label-width="auto" :inline="false" v-model="form">
        <el-form-item label="间隔时间" :prop="'timeout'">
          <el-input-number v-model.number="form.timeout" :stuep="1" :min="2" :max="100" step-strictly></el-input-number>
        </el-form-item>
      </el-form>

      <template #footer>
        <span>
          <el-button @click="showSetting = false">取消</el-button>
          <el-button type="primary" @click="setTimeoutTime">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";
import { ipcRenderer } from "electron";

const emit = defineEmits(["close"]);

const props = defineProps<{
  images: Array<string>;
  index?: number;
}>();
const showImageIndex = ref(
  props.index && props.images[props.index] !== undefined ? props.index : 0
);
const nextImageIndex = computed(() => {
  const index = showImageIndex.value + 1;
  return index >= props.images.length ? 0 : index;
});
const showImage = computed(() => props.images[showImageIndex.value]);
const nextImage = computed(() => props.images[nextImageIndex.value]);

let timer: ReturnType<typeof setTimeout> | undefined;

const timeout = ref(12);

const form = reactive({
  timeout: timeout.value,
});

function next(now = false) {
  if (now) showImageIndex.value = nextImageIndex.value;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    showImageIndex.value = nextImageIndex.value;
    next();
  }, Math.round(timeout.value * 1000));
}

const openMenu = ref(false);

const showSetting = ref(false);

function setTimeoutTime() {
  timeout.value = form.timeout;
  next();
  showSetting.value = false;
  openMenu.value = false;
}

function closeBrowseImages() {
  emit("close");
}

function onVisibilitychange() {
  switch (document.visibilityState) {
    case "hidden":
      if (timer) clearTimeout(timer);
      break;
    case "visible":
      next();
      break;
    default:
      break;
  }
}

onMounted(() => {
  document.addEventListener("visibilitychange", onVisibilitychange);
  next();
  ipcRenderer.send("fullScreen");
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibilitychange);
  ipcRenderer.send("hideFullScreen");
});
</script>

<style lang="scss" scoped>
.browse-images-box {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: #0006;

  .not-image-tip {
    margin: 0 12px;
  }

  .show-image {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
  }

  .next-image {
    position: absolute;
    visibility: hidden;
    z-index: -100;
  }

  .menu {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 201;
    width: 100%;
    height: 100%;

    .menu-item {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: var(--el-text-color-regular);
      cursor: pointer;
    }

    .close {
      top: 40px;
      right: 40px;
    }

    .setting {
      bottom: 40px;
      right: 40px;
    }
  }
}

.browse-image-enter-active,
.browse-image-leave-active {
  transition: all 1.2s;
}

.browse-image-enter-active {
  transform: scale(0.64) !important;
  opacity: 0 !important;
}

.browse-image-enter-to {
  transform: scale(1) !important;
  opacity: 1 !important;
}

.browse-image-leave-to {
  transform: scale(1.2) !important;
  opacity: 0 !important;
}
</style>
