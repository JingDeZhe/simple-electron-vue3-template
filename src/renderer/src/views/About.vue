<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="h-full overflow-auto p-4 all-center">
    <div class="max-w-600px w-full text-center">
      <i class="i-tabler-brand-electron text-5xl text-[var(--primary-color)]"></i>

      <h1 class="text-2xl font-bold mt-4 mb-2">Simple Electron Vue3 Template</h1>
      <p class="text-[var(--text-color-3)] mb-6">
        一个简洁的 Electron + Vue3 基础框架模板，集成现代化前端工具链与原生能力
      </p>

      <div class="grid grid-cols-2 gap-3 text-left">
        <n-card size="small" title="核心框架" :bordered="true">
          <ul class="text-sm list-disc list-inside text-[var(--text-color-2)]">
            <li>Electron 37 — 桌面端容器</li>
            <li>Vue 3.5 — 响应式 UI 框架</li>
            <li>TypeScript 6 — 类型安全</li>
            <li>Vite 8 — 构建与 HMR</li>
          </ul>
        </n-card>

        <n-card size="small" title="状态与路由" :bordered="true">
          <ul class="text-sm list-disc list-inside text-[var(--text-color-2)]">
            <li>Pinia 3 — 状态管理</li>
            <li>Vue Router 5 — 路由导航</li>
            <li>Hash 模式 — 无服务端依赖</li>
            <li>keep-alive — 页面缓存</li>
          </ul>
        </n-card>

        <n-card size="small" title="UI 与样式" :bordered="true">
          <ul class="text-sm list-disc list-inside text-[var(--text-color-2)]">
            <li>Naive UI 2.44 — 组件库</li>
            <li>UnoCSS — 原子化 CSS</li>
            <li>Tabler 图标集</li>
            <li>暗色模式自动适配</li>
          </ul>
        </n-card>

        <n-card size="small" title="原生能力" :bordered="true">
          <ul class="text-sm list-disc list-inside text-[var(--text-color-2)]">
            <li>better-sqlite3 — 本地数据库</li>
            <li>IPC 通信 — 安全双向通道</li>
            <li>自定义标题栏</li>
            <li>electron-log — 日志系统</li>
          </ul>
        </n-card>
      </div>

      <n-divider />

      <div class="text-sm text-[var(--text-color-3)]">
        <p>基于
          <n-a href="https://github.com/alex8088/electron-vite" target="_blank">electron-vite</n-a>
          构建，遵循安全最佳实践（contextIsolation + sandbox）
        </p>
      </div>

      <div class="flex justify-center gap-3 mt-4">
        <n-button @click="router.push('/home')">
          <i class="i-tabler-home"></i>
          返回首页
        </n-button>
        <n-button type="primary" @click="router.push('/ai/config')">
          <i class="i-tabler-settings"></i>
          AI 配置
        </n-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
