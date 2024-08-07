export const injected = `
  if (window.ReactNativeWebView.injectedObjectJson()) {
    const accounts = JSON.parse(window.ReactNativeWebView.injectedObjectJson()).accounts;
    window.accounts = accounts
    console.log(\"in webveiw - window.accounts \", window.accounts)
  }
`
