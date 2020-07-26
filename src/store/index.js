import Vue from 'vue'
import Vuex from 'vuex'
import * as fb from '../firebase'
import router from '../router/index'

Vue.use(Vuex)

fb.postsCollection.orderBy('createdOn', 'desc').onSnapshot(snapshot => {
  let postsArray = []

  snapshot.forEach(doc => {
    let post = doc.data()
    post.id = doc.id

    postsArray.push(post)
  })

  store.commit('SET_POSTS', postsArray)
})

const store = new Vuex.Store({
  state: {
    userProfile: {},
    posts: []
  },
  mutations: {
    SET_USER_PROFILE(state, payload) {
      state.userProfile = payload
    },
    SET_POSTS(state, payload) {
      state.posts = payload
    }
  },
  actions: {
    async login({ dispatch }, form) {
      //sign in user
      const { user } = await fb.auth.signInWithEmailAndPassword(form.email, form.password)

      //fetch user profile and set state
      dispatch('fetchUserProfile', user)
    },
    async signup({ dispatch }, form) {
      //sign user up
      const { user } = await fb.auth.createUserWithEmailAndPassword(form.email, form.password)

      //create user profile object in userCollections
      await fb.usersCollection.doc(user.uid).set({
        name: form.name,
        title: form.title
      })

      //fetch user profile and set in state
      dispatch('fetchUserProfile', user)
    },
    async updateProfile({ dispatch }, user) {
      const userId = fb.auth.currentUser.uid

      //update user object
      const userRef = await fb.usersCollection.doc(userId).update({
        name: user.name,
        title: user.title
      })

      dispatch('fetchUserProfile', { uid: userId })

      //update all posts by user
      const postDocs = await fb.postsCollection.where('userId', '==', userId).get()
      postDocs.forEach(doc => {
        fb.postsCollection.doc(doc.id).update({
          userName: user.name
        })
      })

      //update all comments by user
      const commentDocs = await fb.commentsCollection.where('userId', '==', userId).get()
      commentDocs.forEach(doc => {
        fb.commentsCollection.doc(doc.id).update({
          userName: user.name
        })
      })
    },
    async fetchUserProfile({ commit }, user) {
      //fetch user profile
      const userProfile = await fb.usersCollection.doc(user.uid).get()

      //set user profile in state
      commit('SET_USER_PROFILE', userProfile.data())

      //change route to dashboard
      if (router.currentRoute.path === '/login') {
        router.push('/')
      }
    },
    async createPost({ state, commit }, post) {
      await fb.postsCollection.add({
        createdOn: new Date(),
        content: post.content,
        userId: fb.auth.currentUser.uid,
        userName: state.userProfile.name,
        comments: 0,
        likes: 0
      })
    },
    async likePost({ commit }, post) {
      const userId = fb.auth.currentUser.uid
      const docId = `${userId}_${postId}`

      //check if user has liked post
      const doc = await fb.likesCollection.doc(docId).get()
      if (doc.exists) { return }

      //create like
      await fb.likesCollection.doc(docId).set({
        postId: post.id,
        userId: userId
      })

      //update post likes count
      fb.postsCollection.doc(post.id).update({
        likes: post.likes + 1
      })
    },
    async logout({ commit }) {
      await fb.auth.signOut()

      //clear userProfile and redirect to /login
      commit('SET_USER_PROFILE', {})
      router.push('/login')
    }
  },
  modules: {
  }
})

export default store
