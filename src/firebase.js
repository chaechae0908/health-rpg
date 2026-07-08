import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyC_8sSs9hMFGShwQXHSvbVMp4zkLcWQ17o',
  authDomain: 'chaechae-1e084.firebaseapp.com',
  projectId: 'chaechae-1e084',
  storageBucket: 'chaechae-1e084.firebasestorage.app',
  messagingSenderId: '328619362675',
  appId: '1:328619362675:web:5fc3f6bb08f119401edd06',
  measurementId: 'G-YY2TWYBW0N',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
