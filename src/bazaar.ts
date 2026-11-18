import { BazaarApp, type BazaarOptions } from '@bzr/bazaar'

// koreroapp.com is the landing page: signed-out visitors go there, and its buttons
// link back with ?signin. Read the query before the router's first redirect drops it.
export const LANDING_URL = 'https://koreroapp.com/'
const params = new URLSearchParams(window.location.search)
export const signInRequested = params.has('signin')
// Back from Bazaar's sign-in; the SDK finishes it and fires onLogin
export const signInReturning = params.has('code') && params.has('state')

const config: BazaarOptions = {
  appId: import.meta.env.VITE_APP_ID || 'test',
  loginRedirectUri: window.location.origin,
  onApiConnectError: async function (bzr: BazaarApp, message: string) {
    console.log('OnConnectError', message)
    bzr.logOut()
  },
  onLoginError: async function (bzr: BazaarApp, message: string) {
    console.log('OnLoginError:', message)
    window.location.replace(LANDING_URL)
  }
}

if (import.meta.env.VITE_BAZAAR_URI) {
  config.bazaarUri = import.meta.env.VITE_BAZAAR_URI
} else if (import.meta.env.DEV) {
  config.bazaarUri = 'http://localhost:3377'
}

export const bzr = new BazaarApp(config)
