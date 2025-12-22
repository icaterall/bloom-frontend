export const environment = {
  production: true,
  hmr: false,
  frontendUrl:"https://bloomspectrum.my",
  apiUrl:"https://backend.bloomspectrum.my/api/v1",
  apiSocketUrl:"https://backend.bloomspectrum.my/",
  apiDirectUrl:"https://backend.bloomspectrum.my/",
  apiUploadUrl:"https://anataleb.s3.ap-southeast-1.amazonaws.com/",
  recaptchaSiteKey: '6Le_ytYrAAAAAPtWAIltkJkF4ijMK3jpGVQUEtQ-',
  googleClientId: '602786985054-iejo6vdag2egjug18uiidjmglc250ccg.apps.googleusercontent.com', // Replace with your actual Google Client ID
  enableServiceWorker: false,
  enableAnalytics: false,
    cacheTimeout: 300000, // 5 minutes in milliseconds
 imageOptimization: {
    lazy: true,
    formats: ['webp', 'jpg'],
    sizes: '(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
  }
};