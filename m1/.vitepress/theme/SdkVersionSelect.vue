<script setup>
import { computed, ref } from 'vue'

// 按 M1 SDK 快速开始中的推荐版本排列。
const versions = [
  { sdk: 'v0.2.3', system: 'v0.3.4', changelog: 'v023---2026' },
  { sdk: 'v0.2.2', system: 'v0.3.1 ～ v0.3.3', changelog: 'v022---2026' },
  { sdk: 'v0.2.0', system: 'v0.3.0', changelog: 'v020---2026' },
  { sdk: 'v0.1.1', system: 'v0.1.0-C ～ v0.2.4', changelog: 'v011---2026' },
  { sdk: 'v0.0.3', system: 'v0.0.5 ～ v0.1.0-B', changelog: 'v003---2025' },
]

const selectedSdk = ref(versions[0].sdk)
const selectedVersion = computed(() => versions.find(({ sdk }) => sdk === selectedSdk.value))
const changelogUrl = 'https://github.com/zsibot/genisom_robot_sdk/blob/main/CHANGELOG.md'
</script>

<template>
  <div class="sdk-version">
    <label for="m1-sdk-version">SDK 版本</label>
    <select id="m1-sdk-version" v-model="selectedSdk">
      <option v-for="version in versions" :key="version.sdk" :value="version.sdk">
        {{ version.sdk }}
      </option>
    </select>
    <p class="system-version" aria-live="polite">
      M1 系统 {{ selectedVersion.system }}
    </p>
    <a :href="`${changelogUrl}#${selectedVersion.changelog}`">
      查看 {{ selectedVersion.sdk }} 版本记录
    </a>
  </div>
</template>

<style scoped>
.sdk-version {
  display: grid;
  gap: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  line-height: 20px;
}

label {
  font-size: 14px;
  font-weight: 600;
}

select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.system-version {
  color: var(--vp-c-text-2);
}

a {
  justify-self: start;
  color: var(--vp-c-brand-1);
}

a:hover {
  text-decoration: underline;
}
</style>
