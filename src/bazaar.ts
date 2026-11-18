import { BazaarApp, LoginType, type BazaarOptions } from '@bzr/bazaar'

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

export function installedAsApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// Installed as an app, a login popup opens outside the app's window and can't hand the login back
class KoreroBazaar extends BazaarApp {
  login(options?: Parameters<BazaarApp['login']>[0]) {
    return super.login(
      options ?? { type: installedAsApp() ? LoginType.REDIRECT : LoginType.POPUP_FALLBACK }
    )
  }
}

export const bzr = new KoreroBazaar(config)
