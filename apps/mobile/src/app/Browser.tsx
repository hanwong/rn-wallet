import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { install } from 'react-native-quick-crypto';
import { MNEMONIC } from '@env';
import { generateWallet } from '../scripts/wallet';
import cosmjs from '../scripts/cosmos/cosmjs-proto-signing';
import { injected } from '../scripts/injectedJS';

install();

export default function Wallet() {
  const [accounts, setAccounts] = useState();
  const webView = useRef<WebView>(null);

  useEffect(() => {
    (async () => {
      const w = await generateWallet(MNEMONIC);
      const [a] = await w.getAccounts();
      console.log("in wallet", a)
      setAccounts(a);
    })()
  }, [])

  const onMessage = (event: any) => {
    const message = event.nativeEvent.data;
    console.log("get message")
    Alert.prompt("")
    setTimeout(() => {
      webView.current?.postMessage(JSON.stringify("User rejected."));
    }, 5000)
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
        injectedJavaScriptBeforeContentLoaded={cosmjs}
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
