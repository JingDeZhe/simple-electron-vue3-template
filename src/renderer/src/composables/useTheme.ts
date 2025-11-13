import { darkTheme } from 'naive-ui'
import { useDark, useToggle } from '@vueuse/core'
import { computed } from 'vue'

export function useNaiveTheme() {
  const isDark = useDark()

  const toggleDark = useToggle(isDark)

  // 根据 isDark 返回对应的 Naive UI 主题
  const naiveTheme = computed(() => (isDark.value ? darkTheme : null))

  return {
    isDark,
    toggleDark,
    naiveTheme
  }
}
