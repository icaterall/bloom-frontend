export const environment = {
  production: false,
  hmr: false, 
  frontendUrl:"http://localhost:4100",
  apiUrl:"http://127.0.0.1:3200/api/v1",
  apiDirectUrl:"http://127.0.0.1:3200/",
  apiUploadUrl:"https://pickpickgo.s3.ap-southeast-1.amazonaws.com",
  apiSocketUrl:"http://127.0.0.1:3200/",
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
