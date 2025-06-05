import './assets/main.scss'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useNaive } from './plugins/naive'

const app = createApp(App)

app.use(createPinia())
app.use(router)
useNaive(app)

app.mount('#app')
