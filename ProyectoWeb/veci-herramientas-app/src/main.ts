import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import keycloak from './keycloak'
import { useAuthStore } from './stores/auth'

import './assets/main.css'

keycloak
  .init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',
    checkLoginIframe: false,
  })
  .then(() => {
    const app = createApp(App)
    const pinia = createPinia()

    app.use(pinia)
    app.use(router)
    app.mount('#app')

    if (keycloak.authenticated) {
      const authStore = useAuthStore()
      authStore.syncFromKeycloak()
    }
  })
