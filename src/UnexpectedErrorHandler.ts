import cookieManager from './LocalForageCookieManager'
import requestManager from './RequestManager2'
import * as themeManager from './ThemeManager'
import * as version from './Version'

export default class UnexpectedErrorHandler {

  // only send one report to avoid spamming repeating errors
  private hasSentReport: boolean

  constructor () {
    this.hasSentReport = false
  }

  public initialize () {
    (window as any).onunhandledrejection = async function (e: any) {
      console.error(e)
      try {
        if (!this.hasSentReport) {
          this.hasSentReport = true
          await requestManager.post('/api/errors', {
            error: {
              columnNumber: e.reason.columnNumber,
              fileName: e.reason.fileName,
              lineNumber: e.reason.lineNumber,
              message: e.reason.message,
              name: e.reason.name,
              stack: e.reason.stack
            },
            id: cookieManager.get('id'),
            source: cookieManager.get('source'),
            theme: themeManager.currentThemeName,
            userAgent: window.navigator.userAgent,
            version
          })
        }
      } catch (requestError) {
        console.error(requestError)
      } finally {
        cookieManager.clear()
      }
    }
  }

  get errorOccurred () {
    return this.hasSentReport
  }
}
