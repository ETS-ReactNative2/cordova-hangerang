import firebase from 'firebase'
import Rebase from 're-base'
const config = {
    apiKey: "AIzaSyDVW3dWqqme01JwotFLv0KiX26Kbf1sZ5M",
    authDomain: "hangerang.us",
    databaseURL: "https://fun-food-friends-cf17d.firebaseio.com",
    projectId: "fun-food-friends-cf17d",
    storageBucket: "fun-food-friends-cf17d.appspot.com",
    messagingSenderId: "369783209620"
  };
var app = firebase.initializeApp(config);
var db = firebase.database(app);
export const fbauth = new firebase.auth.FacebookAuthProvider();
export const ggauth = new firebase.auth.GoogleAuthProvider();
export const twauth = new firebase.auth.TwitterAuthProvider();
export const auth = firebase.auth();
export const base = Rebase.createClass(db);
export default firebase;
