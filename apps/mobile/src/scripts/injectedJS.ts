export const injected = `
  if (window.ReactNativeWebView.injectedObjectJson()) {
    const accounts = JSON.parse(window.ReactNativeWebView.injectedObjectJson()).accounts;
    console.log(\"in webveiw - account \", accounts)
    console.log(\"in webveiw\", [{ ...accounts, pubkey: new Uint8Array( Object.keys(accounts.pubkey).map((key) => accounts.pubkey[key])) }])

    const signer = {
      getAccounts: async () => [{ ...accounts, pubkey: new Uint8Array( Object.keys(accounts.pubkey).map((key) => accounts.pubkey[key])) }],
      signDirect: (signerAddress, signDoc) => new Promise((resolve, reject) => {
        
        console.log("add event", signDoc)
        window.addEventListener('message', (event) => {

          const data = JSON.parse(event.data);
          reject(data)
        });

        console.log("request event")
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            method: "signRequest",
            params: {
              signerAddress,
              signDoc,
            },
          })
        );
      })
    }

    window.initiaWebView = {
      getOfflineSigner: () => signer
    }
  }
`
