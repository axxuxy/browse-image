<template>
  <el-config-provider :locale="locale">
    <el-container class="box">
      <el-header class="header">
        <div class="header-start">
          <el-button type="primary" @click="checkAsideState">
            <el-icon v-show="asideState">
              <i-ep-expand />
            </el-icon>
            <el-icon v-show="!asideState">
              <i-ep-fold />
            </el-icon>
          </el-button>
          <router-link to="/" class="to-home">
            <h1>图片浏览器</h1>
          </router-link>
        </div>
        <div>
          <el-button type="primary" @click="addImageDirectory">
            添加目录
            <el-icon>
              <i-ep-folder-add />
            </el-icon>
          </el-button>
        </div>
      </el-header>

      <el-container class="content">
        <transition name="aside">
          <el-aside v-show="store.directorys.length && asideState" class="aside">
            <el-menu mode="vertical" class="nav" router :default-active="path">
              <el-popover v-for="item in store.directorys" :key="item.path" trigger="contextmenu"
                popper-class="context-menu-popover">
                <template #reference>
                  <el-menu-item :index="item.path" :route="{
                    path: '/images',
                    query: {
                      path: item.path,
                    },
                  }">
                    <div class="menu-item-header">
                      <el-image v-if="item.images.length" :src="item.images[0]" fit="cover" loading="lazy">
                        <template #placeholder>
                          <el-icon class="icon-image" :size="48">
                            <i-ep-picture />
                          </el-icon>
                        </template>
                      </el-image>
                      <el-icon v-else class="icon-image" :size="48">
                        <i-ep-picture />
                      </el-icon>
                    </div>
                    <el-tooltip :content="item.dirname" placement="right">
                      <span class="directory-name">{{ item.dirname }}</span>
                    </el-tooltip>
                    <span class="menu-item-end">{{ item.images.length }}张</span>
                  </el-menu-item>
                </template>
                <el-button @click="slideShow(item)"> 幻灯片播放 </el-button>
                <el-button @click="removeDirectory(item)"> 移除目录 </el-button>
              </el-popover>
            </el-menu>
          </el-aside>
        </transition>
        <el-main class="main">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" :key="$route.fullPath"></component>
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    <transition name="el-zoom-in-bottom">
      <browse-images-view v-if="browseImages" :images="browseImages"
        @close="browseImages = undefined"></browse-images-view>
    </transition>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { zhCn } from "element-plus/es/locales";
import BrowseImagesView from "@/views/BrowseImageView.vue";
import { ImageDirectory, useStore } from "@/store";

const store = useStore();

const locale = ref(zhCn);

const router = useRouter();
const route = useRoute();

const asideState = ref(true);
const path = ref<string | null>(null);

watch(
  () => route.fullPath,
  () => {
    if (route.path === "/images") {
      if (path.value !== route.query.path)
        path.value = route.query.path as string;
    } else path.value = null;
  }
);

function checkAsideState() {
  asideState.value = !asideState.value;
}

async function addImageDirectory() {
  const directory = await store.addImageDirectory();
  if (directory) openDirectory(directory);
}

function openDirectory(directory: ImageDirectory) {
  if (directory) {
    router.push({
      name: "images",
      query: {
        path: directory.path,
      },
    });
  }
}

const browseImages = ref();

function slideShow(directory: ImageDirectory) {
  browseImages.value = directory.images;
  document.body.click();
}
function removeDirectory(directory: ImageDirectory) {
  const index = store.directorys.indexOf(directory);
  store.removeImageDirectory(directory.path);
  const dir = store.directorys[index];
  if (dir)
    router.push({
      path: "/images",
      query: {
        path: dir.path,
      },
    });
  else
    router.push({
      path: "/",
    });
  document.body.click();
}
</script>

<style lang="scss">
body {
  margin: 0;

  .box {
    background-color: #fff;

    .header {
      display: flex;
      justify-content: space-between;
      justify-self: center;
      align-items: center;

      .header-start {
        display: flex;
        align-items: center;
        gap: 12px;

        .to-home {
          text-decoration: none;
          color: var(--el-color-primary);

          h1 {
            margin: 0;
          }
        }
      }
    }

    .content {
      border-top: solid 1px #e6e6e6;
      height: calc(100vh - 60px);

      .nav {
        height: 100%;

        .el-menu-item {
          display: flex;
          overflow: hidden;

          .directory-name {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            flex-shrink: 1;
            margin-right: 8px;
          }

          .menu-item-header {
            display: flex;
            justify-content: center;
            width: 48px;
            height: 48px;
            margin-right: 8px;
            border-radius: 4px;
            overflow: hidden;

            .icon-image {
              margin-left: 5px;
            }
          }

          .menu-item-header,
          .menu-item-end {
            flex-shrink: 0;
          }
        }
      }

      .main {
        position: relative;
      }
    }
  }
}

.aside {
  overflow: hidden;
}

.aside-enter-active,
.aside-leave-active {
  transition: all 0.64s;
}

.aside-enter-from,
.aside-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>
