import { defineStore } from 'pinia'
import { auth } from '@/firebase/config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,           // ✅ AJOUTÉ ICI
  sendPasswordResetEmail  // ✅ Optionnel : pour la réinitialisation
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
    error: null
  }),

  actions: {
    async login(email, password) {
      try {
        this.error = null
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
        return userCredential.user
      } catch (error) {
        this.error = error.message || 'Erreur de connexion'
        throw error
      }
    },

    async register(email, password) {
      try {
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        this.user = userCredential.user
      } catch (error) {
        this.error = error.message || 'Erreur d\'inscription'
        throw error
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
      } catch (error) {
        this.error = error.message
      }
    },

    async updateProfile(displayName, photoURL = null) {
      try {
        this.error = null

        if (!auth.currentUser) {
          throw new Error('Non authentifié')
        }

        // ✅ updateProfile est maintenant importé et disponible
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL
        })

        // Met à jour l'utilisateur dans le store
        this.user = auth.currentUser

      } catch (error) {
        this.error = error.message || 'Erreur de mise à jour du profil'
        throw error
      }
    },

    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        this.error = error.message || 'Erreur d\'envoi d\'email'
        throw error
      }
    },

    initializeAuthListener() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.loading = false
      }, (error) => {
        console.error('Erreur auth listener:', error)
        this.loading = false
      })
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,
    isLoading: (state) => state.loading
  }
})
