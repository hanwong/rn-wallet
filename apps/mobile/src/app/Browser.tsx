import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { install } from 'react-native-quick-crypto';
import type { DirectSecp256k1Wallet, AccountData } from "@cosmjs/proto-signing"
import { readFile } from '@dr.pogodin/react-native-fs';
import { resolveAssetsPath } from '@dr.pogodin/react-native-static-server';
import { MNEMONIC } from '@env';
import { generateWallet } from '../scripts/wallet';
import { injected } from '../scripts/injectedJS';

install();

export const useInjectedSourceCode = () => {
  const [code, setCode] = useState<string | undefined>();

  useEffect(() => {
    const fileDir = resolveAssetsPath('webroot');
    readFile(`${fileDir}/injected/injected-common.bundle.js`).then(r => setCode(r));
  }, []);

  return code;
};

export default function Browser() {
  const [wallet, setWallet] = useState<DirectSecp256k1Wallet>();
  const [accounts, setAccounts] = useState<AccountData>();
  const webView = useRef<WebView>(null);
  const sourceCode = useInjectedSourceCode();

  console.log("sourceCode", sourceCode)

  useEffect(() => {
    (async () => {
      const w = await generateWallet(MNEMONIC);
      setWallet(w)
      const [a] = await w.getAccounts();
      console.log("in wallet", a)
      setAccounts(a);
    })()
  }, [])

  const onMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const { signerAddress, signDoc } = message.params
      const parsedSignDoc = {
        chainId: signDoc.chainId,
        bodyBytes: new Uint8Array(Object.keys(signDoc.bodyBytes).map((key) => signDoc.bodyBytes[key])),
        authInfoBytes: new Uint8Array(Object.keys(signDoc.authInfoBytes).map((key) => signDoc.authInfoBytes[key])),
        accountNumber: BigInt(signDoc.accountNumber),
      }

      console.log("message.params", message.params)
      const result = await wallet?.signDirect(signerAddress, parsedSignDoc)
      console.log("signDirect result", result)
      webView.current?.postMessage(JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() + "n" : value
      ));
    } catch (error) {
      console.log("error", error)
      webView.current?.postMessage(JSON.stringify(error));
    }
  }

  return (
    <View style={styles.webview}>
      <WebView
        ref={webView}
        source={{ uri: "http://samuels.local:5100" }}
        javaScriptEnabled
        allowsInlineMediaPlayback
        injectedJavaScript={injected}
        injectedJavaScriptObject={{ accounts }}
        injectedJavaScriptBeforeContentLoaded={sourceCode}
        webviewDebuggingEnabled
        cacheMode="LOAD_NO_CACHE"
        onMessage={onMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});
