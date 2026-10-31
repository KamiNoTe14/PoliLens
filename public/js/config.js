// Fill these in before deploying. See README.md.
// Leaving `firebase` as null runs the site in demo mode: results use
// generated sample data and the page says so clearly.

export const CONFIG = {
  siteName: 'PoliLens',

  // Paste the web app config from Firebase console → Project settings → Your apps.
  firebase: {
    apiKey: 'AIzaSyA4sD9K8v0_fKHzykkqJGix0Duj3buwlnA',
    authDomain: 'polilens-309d9.firebaseapp.com',
    projectId: 'polilens-309d9',
    storageBucket: 'polilens-309d9.firebasestorage.app',
    messagingSenderId: '347429972757',
    appId: '1:347429972757:web:7c97690333575b40ac171c',
  },

  // Optional: reCAPTCHA v3 site key for Firebase App Check (strongly recommended
  // before launch so bots can't flood the totals).
  appCheckSiteKey: '',

  // Google Civic Information API key (restrict it to your domain in Google Cloud).
  // Without it, the ballot page links out to official lookup tools instead.
  civicApiKey: '',
};
