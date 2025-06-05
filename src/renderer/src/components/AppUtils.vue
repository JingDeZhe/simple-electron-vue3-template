<script setup lang="ts">
import { useDialog, useLoadingBar, useMessage, useNotification } from 'naive-ui'

const message = useMessage()
const dialog = useDialog()
const notification = useNotification()
const loadingBar = useLoadingBar()

window.$message = message
window.$dialog = dialog
window.$notification = notification
window.$loadingBar = loadingBar
</script>

<template>
  <slot></slot>
</template>

<style lang="scss"></style>
