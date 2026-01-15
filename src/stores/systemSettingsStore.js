import { defineStore } from 'pinia'
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { SystemSettingsModel } from 'src/services/models/SystemSettings.js'

export const useSystemSettingsStore = defineStore('systemSettings', {
  state: () => ({
    settings: null,
    loading: false,
  }),

  actions: {
    async fetchSettings() {
      this.loading = true
      try {
        const querySnapshot = await getDocs(collection(db, 'systemSettings'))
        if (!querySnapshot.empty) {
          this.settings = SystemSettingsModel.fromFirestore(querySnapshot.docs[0])
        } else {
          this.settings = new SystemSettingsModel()
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveSettings(data) {
      this.loading = true
      try {
        const settingsObj = new SystemSettingsModel(data)

        if (data.id) {
          // Update existing
          const docRef = doc(db, 'systemSettings', data.id)
          await updateDoc(docRef, settingsObj.toFirestore())
          this.settings = settingsObj
        } else {
          // Create new
          const docRef = await addDoc(collection(db, 'systemSettings'), settingsObj.toFirestore())
          this.settings = new SystemSettingsModel({ ...data, id: docRef.id })
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
})
