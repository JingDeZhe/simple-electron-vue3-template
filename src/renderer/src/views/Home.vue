<script setup lang="ts">
import { ref } from 'vue'

const testResult = ref<any>({})
const loading = ref(false)
const handleTestDB = async () => {
  loading.value = true
  try {
    // 通过Electron IPC调用数据库测试
    const result = await window.electron.testDatabase()
    testResult.value = result
    console.log('测试数据库连接：', result)
  } catch (error: any) {
    testResult.value = {
      connectionStatus: 'failure',
      error: error.message
    }
  } finally {
    loading.value = false
  }
}

handleTestDB()
</script>

<template>
  <n-layout content-class="p-2 all-center">
    <n-h1>Electron + Vite + Vue3 + Sqlite3</n-h1>
    <n-p
      >测试sqlite3是否正常连接
      <n-button type="primary" text @click="handleTestDB">
        {{ !loading ? '测试' : '测试中...' }}
      </n-button>
    </n-p>
    <div className="test-result" v-if="testResult">
      <h3>测试结果:</h3>
      <p>
        <strong>连接状态:</strong>
        {{ testResult.connectionStatus === 'success' ? '✅ 成功' : '❌失败' }}
      </p>
      <p v-if="testResult.error"><strong>错误信息:</strong> {{ testResult.error }}</p>
      <p><strong>SQLite版本:</strong> {{ testResult.version || '未知' }}</p>
      <p><strong>FTS5支持:</strong> {{ testResult.fts5Enabled ? '✅ 已启用' : '❌ 不可用' }}</p>
      <p><strong>JSON1支持:</strong> {{ testResult.json1Enabled ? '✅ 已启用' : '❌ 不可用' }}</p>
    </div>
  </n-layout>
</template>

<style lang="scss"></style>
