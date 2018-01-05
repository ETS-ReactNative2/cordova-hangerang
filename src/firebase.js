import firebase from 'firebase'
const config = {
    apiKey: "AIzaSyDVW3dWqqme01JwotFLv0KiX26Kbf1sZ5M",
    authDomain: "fun-food-friends-cf17d.firebaseapp.com",
    databaseURL: "https://fun-food-friends-cf17d.firebaseio.com",
    projectId: "fun-food-friends-cf17d",
    storageBucket: "",
    messagingSenderId: "369783209620"
  };
firebase.initializeApp(config);
export const provider = new firebase.auth.FacebookAuthProvider();
export const auth = firebase.auth();
export default firebase;
