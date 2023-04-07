<template>
  <div class="box">
    <el-button type="primary" @click="addImageDirectory">
      添加目录
      <el-icon>
        <i-ep-plus />
      </el-icon>
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "@/store";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

async function addImageDirectory() {
  const directory = await store.addImageDirectory();
  if (directory)
    router.push({
      path: "/images",
      query: {
        path: directory.path,
      },
    });
}
</script>

<style scoped>
.box {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}
</style>
