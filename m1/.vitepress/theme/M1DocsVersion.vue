<script setup>
defineProps({
  docsVersion: { type: String, required: true },
  sdkVersion: { type: String, required: true },
  screenMenu: Boolean,
})
</script>

<template>
  <span class="docs-version" :class="{ 'screen-menu': screenMenu }">
    {{ docsVersion }}（SDK版本{{ sdkVersion }}）
  </span>
</template>

<style scoped>
.docs-version {
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.screen-menu {
  min-height: 49px;
  padding: 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
</style>
