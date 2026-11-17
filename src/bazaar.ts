import { BazaarApp, LoginType, type BazaarOptions } from '@bzr/bazaar'

const config: BazaarOptions = {
  appId: import.meta.env.VITE_APP_ID || 'test',
  loginRedirectUri: window.location.origin,
  onApiConnectError: async function (bzr: BazaarApp, message: string) {
    console.log('OnConnectError', message)
    bzr.logOut()
  },
  onLoginError: async function (bzr: BazaarApp, message: string) {
    console.log('OnLoginError:', message)
  }
}

if (import.meta.env.VITE_BAZAAR_URI) {
  config.bazaarUri = import.meta.env.VITE_BAZAAR_URI
} else if (import.meta.env.DEV) {
  config.bazaarUri = 'http://localhost:3377'
}

// Installed as an app, a login popup opens outside the app's window and can't hand the login back
class KoreroBazaar extends BazaarApp {
  login(options?: Parameters<BazaarApp['login']>[0]) {
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    return super.login(
      options ?? { type: installed ? LoginType.REDIRECT : LoginType.POPUP_FALLBACK }
    )
  }
}

export const bzr = new KoreroBazaar(config)
