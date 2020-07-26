import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

//firebase init 
const firebaseConfig = {
  apiKey: "AIzaSyBJ7brCqAQ5DqKdBW9RRKSfolbjD8mGLHw",
  authDomain: "vue-gram-95fbe.firebaseapp.com",
  databaseURL: "https://vue-gram-95fbe.firebaseio.com",
  projectId: "vue-gram-95fbe",
  storageBucket: "vue-gram-95fbe.appspot.com",
  messagingSenderId: "216327489445",
  appId: "1:216327489445:web:7d6ae279f318051abf4a4c"
}

firebase.initializeApp(firebaseConfig)

//utils
const db = firebase.firestore()
const auth = firebase.auth()

//collection references
const usersCollection = db.collection('users')
const postsCollection = db.collection('posts')
const commentsCollection = db.collection('comments')
const likesCollection = db.collection('likes')

//export utils/refs
export {
  db,
  auth,
  usersCollection,
  postsCollection,
  commentsCollection,
  likesCollection
}