<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores'
import { useNaiveTheme } from '@/composables/useTheme'

const router = useRouter()
const counter = useCounterStore()
const { isDark, toggleDark } = useNaiveTheme()

// ── 数据库状态 ──
const dbResult = ref<any>(null)
const dbLoading = ref(false)

async function testDatabase() {
  dbLoading.value = true
  try {
    dbResult.value = await window.electron.testDatabase()
  } catch (error: any) {
    dbResult.value = { connectionStatus: 'failure', error: error.message }
  } finally {
    dbLoading.value = false
  }
}

// ── AI 配置数量 ──
const aiConfigCount = ref<number | null>(null)
async function loadAIConfigCount() {
  try {
    const configs = await window.api.aiConfig.getAll()
    aiConfigCount.value = configs.length
  } catch {
    aiConfigCount.value = null
  }
}

// ── 系统版本信息 ──
const versions = computed(() => {
  const ua = navigator.userAgent
  return {
    node: ua.match(/Electron\/(\S+)\s/)?.[1] || '—',
    chrome: ua.match(/Chrome\/(\S+)/)?.[1] || '—',
    electron: ua.match(/Electron\/(\S+)/)?.[1] || '—',
    platform: navigator.platform
  }
})

// ── 时间（用于展示响应式更新）──
const now = ref(new Date())
const timer = setInterval(() => {
  now.value = new Date()
}, 1000)

// ── 窗口控制（提前解构避免模板中 window 类型问题）──
const { minimize, toggleMaximize, close: closeWindow } = window.electron

onMounted(() => {
  testDatabase()
  loadAIConfigCount()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="h-full overflow-auto p-4">
    <!-- 欢迎区域 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold m-0">🏠 框架功能概览</h1>
      <p class="mt-1 text-[var(--text-color-3)]">
        Electron + Vue3 + TypeScript 基础框架，以下展示了框架集成的各项核心能力
      </p>
    </div>

    <!-- 功能卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <!-- 技术栈 -->
      <n-card title="🛠️ 技术栈" :bordered="true" size="small">
        <div class="flex flex-wrap gap-2">
          <n-tag type="info" size="medium">Electron</n-tag>
          <n-tag type="success" size="medium">Vue 3</n-tag>
          <n-tag type="warning" size="medium">TypeScript</n-tag>
          <n-tag type="error" size="medium">Vite</n-tag>
          <n-tag type="info" size="medium">Pinia</n-tag>
          <n-tag type="success" size="medium">Vue Router</n-tag>
          <n-tag size="medium">Naive UI</n-tag>
          <n-tag size="medium">UnoCSS</n-tag>
          <n-tag size="medium">better-sqlite3</n-tag>
        </div>
      </n-card>

      <!-- SQLite 数据库 -->
      <n-card title="🗄️ SQLite 数据库" :bordered="true" size="small">
        <div class="flex flex-col gap-3">
          <div v-if="dbLoading" class="flex items-center gap-2">
            <n-spin size="small" />
            <span class="text-[var(--text-color-3)]">检测中...</span>
          </div>
          <template v-else-if="dbResult">
            <div class="flex items-center gap-2">
              <n-tag :type="dbResult.connectionStatus === 'success' ? 'success' : 'error'" size="small">
                {{ dbResult.connectionStatus === 'success' ? '✅ 正常' : '❌ 异常' }}
              </n-tag>
              <span class="text-sm text-[var(--text-color-3)]">
                SQLite {{ dbResult.version || '—' }}
              </span>
            </div>
            <div class="flex gap-3 text-sm">
              <div class="flex items-center gap-1">
                <i class="i-tabler-search"></i>
                FTS5: {{ dbResult.fts5Enabled ? '✅' : '❌' }}
              </div>
              <div class="flex items-center gap-1">
                <i class="i-tabler-json"></i>
                JSON1: {{ dbResult.json1Enabled ? '✅' : '❌' }}
              </div>
            </div>
          </template>
          <n-button size="small" @click="testDatabase" :loading="dbLoading">
            重新检测
          </n-button>
        </div>
      </n-card>

      <!-- Pinia 状态管理 -->
      <n-card title="🍍 Pinia 状态管理" :bordered="true" size="small">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-[var(--primary-color)]">{{ counter.count }}</div>
              <div class="text-xs text-[var(--text-color-3)]">计数</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-[var(--primary-color)]">{{ counter.doubleCount }}</div>
              <div class="text-xs text-[var(--text-color-3)]">双倍 (computed)</div>
            </div>
          </div>
          <div class="flex gap-2">
            <n-button type="primary" size="small" @click="counter.increment()">
              <i class="i-tabler-plus"></i>
              增加
            </n-button>
            <n-button size="small" @click="counter.reset()">
              <i class="i-tabler-refresh"></i>
              重置
            </n-button>
          </div>
          <n-text depth="3" class="text-xs">
            数据存储在 Pinia store 中，关闭窗口后重置（未持久化）
          </n-text>
        </div>
      </n-card>

      <!-- 主题切换 -->
      <n-card title="🌓 主题切换" :bordered="true" size="small">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-4">
            <n-switch :value="isDark" @update:value="toggleDark()" size="large">
              <template #checked>
                <i class="i-tabler-moon-filled"></i>
              </template>
              <template #unchecked>
                <i class="i-tabler-sun-filled"></i>
              </template>
            </n-switch>
            <div>
              <div class="font-medium">{{ isDark ? '🌙 暗色模式' : '☀️ 亮色模式' }}</div>
              <div class="text-xs text-[var(--text-color-3)]">
                基于 @vueuse/core useDark + Naive UI darkTheme
              </div>
            </div>
          </div>

          <!-- 颜色预览条 -->
          <div class="flex gap-1">
            <div
              v-for="c in ['var(--primary-color)', 'var(--info-color)', 'var(--success-color)', 'var(--warning-color)', 'var(--error-color)']"
              :key="c"
              class="h-6 flex-1 rounded"
              :style="{ backgroundColor: `color-mix(in srgb, ${c} 20%, transparent)` }"
            ></div>
          </div>
        </div>
      </n-card>

      <!-- AI 配置 -->
      <n-card title="🤖 AI 配置管理" :bordered="true" size="small">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <n-tag type="info" size="medium">
              {{ aiConfigCount !== null ? `${aiConfigCount} 个配置` : '加载中...' }}
            </n-tag>
            <span class="text-sm text-[var(--text-color-3)]">支持 OpenAI 兼容 API</span>
          </div>
          <div class="flex gap-2">
            <n-button type="primary" size="small" @click="router.push('/ai/config')">
              <i class="i-tabler-settings"></i>
              管理 AI 配置
            </n-button>
          </div>
          <n-text depth="3" class="text-xs">
            支持多 API 端点，OpenAI / DeepSeek / 通义千问 等兼容接口
          </n-text>
        </div>
      </n-card>

      <!-- 系统信息 -->
      <n-card title="💻 系统信息" :bordered="true" size="small">
        <div class="flex flex-col gap-2 text-sm">
          <div class="flex justify-between">
            <span class="text-[var(--text-color-3)]">运行平台</span>
            <span>{{ versions.platform }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-color-3)]">Electron</span>
            <span>{{ versions.electron }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-color-3)]">Chrome</span>
            <span>{{ versions.chrome }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--text-color-3)]">Node.js</span>
            <span>{{ versions.node }}</span>
          </div>
          <n-divider class="my-1" />
          <div class="flex justify-between text-xs text-[var(--text-color-3)]">
            <span>当前时间</span>
            <span>{{ now.toLocaleTimeString('zh-CN') }}</span>
          </div>
        </div>
      </n-card>

      <!-- 路由导航 -->
      <n-card title="🧭 页面路由" :bordered="true" size="small">
        <div class="flex flex-col gap-2">
          <n-button text @click="router.push('/home')" class="justify-start">
            <i class="i-tabler-home"></i>
            <span class="ml-2">首页 /home</span>
          </n-button>
          <n-button text @click="router.push('/about')" class="justify-start">
            <i class="i-tabler-info-circle"></i>
            <span class="ml-2">关于 /about</span>
          </n-button>
          <n-button text @click="router.push('/ai/config')" class="justify-start">
            <i class="i-tabler-brand-adobe-illustrator"></i>
            <span class="ml-2">AI 配置 /ai/config</span>
          </n-button>
        </div>
        <template #footer>
          <n-text depth="3" class="text-xs">
            Hash 模式路由 (createWebHashHistory)，无服务端配置依赖
          </n-text>
        </template>
      </n-card>

      <!-- 窗口控制 -->
      <n-card title="🪟 自定义窗口控制" :bordered="true" size="small">
        <div class="flex flex-col gap-4">
          <div class="flex gap-2">
            <n-button size="small" @click="minimize()">
              <i class="i-tabler-minus"></i>
            </n-button>
            <n-button size="small" @click="toggleMaximize()">
              <i class="i-tabler-maximize"></i>
            </n-button>
            <n-button size="small" @click="closeWindow()">
              <i class="i-tabler-x"></i>
            </n-button>
          </div>
          <n-text depth="3" class="text-xs">
            基于 Electron <code>frame: false</code> 无边框窗口 + IPC 通信实现自定义标题栏。
            标题栏右侧按钮亦使用相同机制，窗口状态通过
            <code>ipcMain.handle</code> / <code>ipcRenderer.invoke</code> 同步
          </n-text>
        </div>
      </n-card>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
