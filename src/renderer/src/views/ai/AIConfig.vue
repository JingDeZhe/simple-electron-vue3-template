<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import type { AIConfig, CreateAIConfigInput } from '@shared/type'
import { toDeepRaw } from '@/utils'
import { useRouter } from 'vue-router'

const message = useMessage()
const dialog = useDialog()

const configs = ref<AIConfig[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingConfig = ref<AIConfig | null>(null)

const formData = ref<CreateAIConfigInput>({
  name: '',
  baseURL: '',
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxTokens: undefined,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  isDefault: false
})

async function loadConfigs() {
  try {
    loading.value = true
    configs.value = await window.api.aiConfig.getAll()
  } catch (error: any) {
    message.error(error.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingConfig.value = null
  formData.value = {
    name: '',
    baseURL: '',
    apiKey: '',
    model: '',
    temperature: 0.7,
    maxTokens: undefined,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
    isDefault: false
  }
  showModal.value = true
}

function openEditModal(config: AIConfig) {
  editingConfig.value = config
  formData.value = {
    name: config.name,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model || '',
    temperature: config.temperature || 0.7,
    maxTokens: config.maxTokens,
    topP: config.topP || 1.0,
    frequencyPenalty: config.frequencyPenalty || 0,
    presencePenalty: config.presencePenalty || 0,
    isDefault: config.isDefault
  }
  showModal.value = true
}

async function saveConfig() {
  try {
    if (!formData.value.name || !formData.value.baseURL || !formData.value.apiKey) {
      message.error('请填写必填项')
      return
    }

    loading.value = true

    if (editingConfig.value) {
      // 使用 toDeepRaw 解除 Vue 响应式代理，避免 IPC 序列化失败
      await window.api.aiConfig.update(
        toDeepRaw({
          id: editingConfig.value.id,
          ...formData.value
        })
      )
      message.success('更新成功')
    } else {
      await window.api.aiConfig.create(toDeepRaw(formData.value))
      message.success('创建成功')
    }

    showModal.value = false
    await loadConfigs()
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

function deleteConfig(config: AIConfig) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除配置 "${config.name}" 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        loading.value = true
        await window.api.aiConfig.delete(config.id)
        message.success('删除成功')
        await loadConfigs()
      } catch (error: any) {
        message.error(error.message || '删除失败')
      } finally {
        loading.value = false
      }
    }
  })
}

async function setDefault(config: AIConfig) {
  try {
    loading.value = true
    await window.api.aiConfig.update({
      id: config.id,
      isDefault: true
    })
    message.success('设置成功')
    await loadConfigs()
  } catch (error: any) {
    message.error(error.message || '设置失败')
  } finally {
    loading.value = false
  }
}

async function testConnection(config: AIConfig) {
  try {
    loading.value = true
    const result = await window.api.aiConfig.testConnection(config.id)
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  } catch (error: any) {
    message.error(error.message || '测试失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConfigs()
})

const router = useRouter()
function back() {
  router.back()
}
</script>

<template>
  <div class="h-full overflow-hidden">
    <n-card :bordered="false" title="AI 配置管理" class="h-full" content-class="overflow-auto">
      <template #header-extra>
        <div class="flex gap-2">
          <n-button @click="back">返回</n-button>
          <n-button type="primary" @click="openCreateModal">新增配置</n-button>
        </div>
      </template>
      <n-empty v-if="configs.length === 0" description="暂无配置，请添加" />
      <n-list v-else bordered>
        <n-list-item v-for="config in configs" :key="config.id">
          <template #prefix>
            <n-tag v-if="config.isDefault" type="success" size="small">默认</n-tag>
          </template>
          <div class="flex gap-1 items-center">
            <div class="config-item">
              <div class="config-info">
                <div class="config-name">{{ config.name }}</div>
                <div class="config-details">
                  <n-text depth="3">
                    <span>端点: {{ config.baseURL }}</span>
                    <n-divider vertical />
                    <span v-if="config.model">模型: {{ config.model }}</span>
                  </n-text>
                </div>
              </div>
            </div>
            <div class="flex gap-2 ml-auto">
              <n-button size="small" @click="testConnection(config)">测试连接</n-button>
              <n-button size="small" @click="openEditModal(config)">编辑</n-button>
              <n-button
                v-if="!config.isDefault"
                size="small"
                type="primary"
                @click="setDefault(config)"
              >
                设为默认
              </n-button>
              <n-button size="small" type="error" @click="deleteConfig(config)">删除</n-button>
            </div>
          </div>
        </n-list-item>
      </n-list>
    </n-card>

    <n-modal v-model:show="showModal" :mask-closable="false">
      <n-card
        :title="editingConfig ? '编辑配置' : '新增配置'"
        :bordered="false"
        class="max-w-90vw w-800px"
      >
        <n-form :model="formData" label-placement="left" label-width="120" class="grid grid-cols-2">
          <n-form-item label="配置名称" required>
            <n-input v-model:value="formData.name" placeholder="请输入配置名称" />
          </n-form-item>

          <n-form-item label="API 端点" required>
            <n-input
              v-model:value="formData.baseURL"
              placeholder="例如: https://api.deepseek.com"
            />
          </n-form-item>

          <n-form-item label="API 密钥" required>
            <n-input
              v-model:value="formData.apiKey"
              type="password"
              show-password-on="click"
              placeholder="请输入 API Key"
            />
          </n-form-item>

          <n-form-item label="默认模型">
            <n-input v-model:value="formData.model" placeholder="例如: deepseek-chat, qwen-flash" />
          </n-form-item>

          <n-form-item label="Temperature">
            <n-input-number
              v-model:value="formData.temperature"
              :min="0"
              :max="2"
              :step="0.1"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="Max Tokens">
            <n-input-number
              v-model:value="formData.maxTokens"
              :min="1"
              :step="100"
              placeholder="可选"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="Top P">
            <n-input-number
              v-model:value="formData.topP"
              :min="0"
              :max="1"
              :step="0.1"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="Frequency Penalty">
            <n-input-number
              v-model:value="formData.frequencyPenalty"
              :min="-2"
              :max="2"
              :step="0.1"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="Presence Penalty">
            <n-input-number
              v-model:value="formData.presencePenalty"
              :min="-2"
              :max="2"
              :step="0.1"
              style="width: 100%"
            />
          </n-form-item>

          <n-form-item label="设为默认">
            <n-switch v-model:value="formData.isDefault" />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="showModal = false">取消</n-button>
            <n-button type="primary" :loading="loading" @click="saveConfig">保存</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style lang="scss" scoped></style>
