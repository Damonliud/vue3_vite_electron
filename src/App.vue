<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useCounterStore } from "./stores/counter"
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
let store = useCounterStore()
let { relatedExcelData } = storeToRefs(store)
let isShow = computed(() => Object.keys(relatedExcelData.value).length != 0)
</script>

<template>
  <div class="app">
    <RouterLink
      custom
      v-slot="{ href, navigate, isActive, isExactActive }"
      to="/"
    >
      <el-button
        :href="href"
        @click="navigate"
        :type="isActive ? 'primary' : 'info'"
        :plain="!isExactActive"
      >
        Table
      </el-button>
    </RouterLink>
    <RouterLink
      v-if="isShow"
      custom
      v-slot="{ href, navigate, isActive, isExactActive }"
      to="/chart1"
    ><el-button
        :href="href"
        @click="navigate"
        :type="isActive ? 'primary' : 'info'"
        :plain="!isExactActive"
      >
        Quarter Related Chart
      </el-button>
    </RouterLink>
    <RouterLink
      v-if="isShow"
      custom
      v-slot="{ href, navigate, isActive, isExactActive }"
      to="/chart2"
    ><el-button
        :href="href"
        @click="navigate"
        :type="isActive ? 'primary' : 'info'"
        :plain="!isExactActive"
      >
        Quarter Chart
      </el-button>
    </RouterLink>
    <el-divider />
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>
<style lang="scss" scoped>
.app {
  width: 100%;
  padding: 24px;
}
</style>
