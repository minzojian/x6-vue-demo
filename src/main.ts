import { createApp } from "vue";
import App from "./App.vue";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')


// import { h, createApp } from '@vue/runtime-dom'

// const RootComponent = {
//   render() {
//     return h('div', 'hello world')
//   }
// }

// createApp(RootComponent).mount('#app')