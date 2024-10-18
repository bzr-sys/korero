import { BazaarApp, type BazaarOptions } from '@bzr/bazaar'

const baseURL = window.location.origin + window.location.pathname

const config: BazaarOptions = {
  appId: import.meta.env.VITE_APP_ID || 'test',
  loginRedirectUri: `${baseURL}`,
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

export const bzr = new BazaarApp(config)
