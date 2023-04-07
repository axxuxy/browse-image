import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/images",
      name: "images",
      component: () => import("@/views/ImagesView.vue"),
      props: (to) => to.query,
    },
  ],
});

export default router;
