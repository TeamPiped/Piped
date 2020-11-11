import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbsUp, faThumbsDown, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faThumbsUp, faThumbsDown, faEye)

import "uikit/src/less/uikit.less";
import "uikit/dist/js/uikit.min.js";

import router from '@/router/router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')