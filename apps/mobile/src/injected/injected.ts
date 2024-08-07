import type { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import type { Algo, DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing"

declare global {
  interface Window {
    initiaWebView?: any
    accounts?: {
      address: string
      algo: Algo
      pubkey: Record<string, number>
    }
    ReactNativeWebView?: any
  }
}

export default class OfflineSigner implements OfflineDirectSigner {
  async getAccounts() {
    if (!window?.accounts) throw new Error("accounts not found")
    const { address, algo, pubkey } = window?.accounts
    return [
      { address, algo, pubkey: new Uint8Array(Object.keys(pubkey).map((key) => pubkey[key])) },
    ]
  }

  signDirect(signerAddress: string, signDoc: SignDoc) {
    console.log("signDoc", signDoc)

    return new Promise<DirectSignResponse>((resolve, reject) => {
      window?.ReactNativeWebView.postMessage(
        JSON.stringify({
          method: "signRequest",
          params: {
            signerAddress,
            signDoc,
          },
        }),
      )

      window.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log("DirectSignResponse", data)
          const parsedResponse = {
            signature: data.signature,
            signed: {
              chainId: data.signed.chainId,
              bodyBytes: new Uint8Array(
                Object.keys(data.signed.bodyBytes).map((key) => data.signed.bodyBytes[key]),
              ),
              authInfoBytes: new Uint8Array(
                Object.keys(data.signed.authInfoBytes).map((key) => data.signed.authInfoBytes[key]),
              ),
              accountNumber: data.signed.accountNumber,
            },
          }
          return resolve(parsedResponse)
        } catch (error) {
          return reject(error)
        }
      })
    })
  }
}
