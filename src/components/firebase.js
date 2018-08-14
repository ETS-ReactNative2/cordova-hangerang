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
export const provider = new firebase.auth.FacebookAuthProvider();
provider.addScope('user_friends');
provider.setCustomParameters({'display': 'popup'});
export const auth = firebase.auth();
export const base = Rebase.createClass(db);
export default firebase;
