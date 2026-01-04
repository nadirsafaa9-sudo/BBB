import { defineStore } from 'pinia'
import { db } from '@/firebase/config'
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  /*updateDoc,
  deleteDoc,*/
  serverTimestamp,
 /* increment*/
} from 'firebase/firestore'

export const useForumStore = defineStore('forum', {
  state: () => ({
    discussions: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchDiscussions(max = 10) {
      try {
        this.loading = true
        const discussionsRef = collection(db, 'discussions')
        const q = query(
          discussionsRef,
          orderBy('createdAt', 'desc'),
          limit(max)
        )

        const querySnapshot = await getDocs(q)
        this.discussions = []

        querySnapshot.forEach((doc) => {
          this.discussions.push({
            id: doc.id,
            ...doc.data()
          })
        })
      } catch (error) {
        this.error = error.message
        console.error('Erreur chargement discussions:', error)
      } finally {
        this.loading = false
      }
    },

    async createDiscussion(data) {
      try {
        const discussionData = {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 0,
          repliesCount: 0
        }

        const discussionsRef = collection(db, 'discussions')
        const docRef = await addDoc(discussionsRef, discussionData)
        return docRef.id

      } catch (error) {
        console.error('Erreur création discussion:', error)
        throw error
      }
    }
  },

  getters: {
    recentDiscussions: (state) => state.discussions.slice(0, 5),
    popularDiscussions: (state) => [...state.discussions]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
  }
})
