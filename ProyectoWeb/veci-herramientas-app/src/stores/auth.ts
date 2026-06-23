import { defineStore } from 'pinia'
import axios from 'axios'
import keycloak from '../keycloak'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

interface User {
  userId: string
  email: string
  name: string
  role: 'user' | 'admin'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: () => keycloak.authenticated ?? false,
    isAdmin: (state) => state.user?.role === 'admin',
    token: () => keycloak.token ?? null,
  },

  actions: {
    async login() {
      await keycloak.login({
        redirectUri: window.location.origin + '/dashboard',
      })
    },

    async logout() {
      this.user = null
      await keycloak.logout({
        redirectUri: window.location.origin + '/login',
      })
    },

    syncFromKeycloak() {
      if (!keycloak.authenticated || !keycloak.tokenParsed) return
      const p = keycloak.tokenParsed as any
      const roles: string[] = p.resource_access?.['veci-herramientas']?.roles ?? p.realm_access?.roles ?? []
      this.user = {
        userId: p.sub,
        email: p.email ?? '',
        name: p.preferred_username ?? p.name ?? p.email ?? '',
        role: roles.includes('admin') ? 'admin' : 'user',
      }
    },

    async fetchProfile() {
      if (!keycloak.authenticated || !keycloak.token) return
      try {
        const response = await api.get<User>('/auth/profile', {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })
        this.user = response.data
      } catch {
        this.user = null
      }
    },

    async refreshToken() {
      if (!keycloak.authenticated) return
      try {
        const refreshed = await keycloak.updateToken(30)
        if (refreshed) this.syncFromKeycloak()
      } catch {
        await this.logout()
      }
    },
  },
})
