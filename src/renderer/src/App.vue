<script setup lang="ts">
import { useNaiveTheme } from '@/composables/useTheme'
import { zhCN, dateZhCN } from 'naive-ui'
import AppUtils from './components/AppUtils.vue'

const { naiveTheme } = useNaiveTheme()
</script>

<template>
  <n-config-provider :theme="naiveTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-loading-bar-provider>
            <AppUtils>
              <router-view></router-view>
            </AppUtils>
          </n-loading-bar-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss"></style>
