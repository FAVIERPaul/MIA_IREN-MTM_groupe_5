// Initialize Firebase
// Replace the following with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Example function to save data
export function saveData(collection, data) {
  return firebase.firestore().collection(collection).add(data);
}

// Example function to fetch data
export function fetchData(collection) {
  return firebase.firestore().collection(collection).get();
}