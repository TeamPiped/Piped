import { createApp } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faThumbsUp, faThumbsDown, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faThumbsUp, faThumbsDown, faEye)

require("uikit/src/less/uikit.less")
require("uikit/dist/js/uikit.min.js")

import router from '@/router/router'
import App from './App.vue'

import './registerServiceWorker'

const app = createApp(App)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
