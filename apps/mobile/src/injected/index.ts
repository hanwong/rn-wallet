import OfflineSigner from "./injected";


window.initiaWebView = {
  getOfflineSigner: () => new OfflineSigner(),
}