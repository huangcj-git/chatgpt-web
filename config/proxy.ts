import type { ProxyOptions } from 'vite'

export function createViteProxy(isOpenProxy: boolean, viteEnv: ImportMetaEnv) {
  if (!isOpenProxy)
    return

  const proxy: Record<string, string | ProxyOptions> = {
    '/api/translate': {
      target: 'http://127.0.0.1:18888/',
      changeOrigin: true,
      rewrite: path => path.replace('/api/translate', '/translate'),
    },
    '/api': {
      target: viteEnv.VITE_APP_API_BASE_URL,
      changeOrigin: true,
      rewrite: path => path.replace('/api/', '/'),
    },
  }

  return proxy
}
