import { darkTheme } from 'naive-ui'
import { useDark, useToggle } from '@vueuse/core'
import { computed } from 'vue'

// 模块级单例，确保全局主题状态一致
const isDark = useDark()
const toggleDark = useToggle(isDark)
const naiveTheme = computed(() => (isDark.value ? darkTheme : null))

export function useNaiveTheme() {
  return {
    isDark,
    toggleDark,
    naiveTheme
  }
}
