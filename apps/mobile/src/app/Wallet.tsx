import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { install } from 'react-native-quick-crypto';
import { copyFileAssets, readFile, readFileAssets, unlink } from '@dr.pogodin/react-native-fs';
import Server, { STATES, resolveAssetsPath } from '@dr.pogodin/react-native-static-server';
import { generateWallet } from '../scripts/wallet';
import { MNEMONIC } from '@env';
import { useInjectedSourceCode } from './Browser';
import { injected } from '../scripts/injectedJS';
import type { AccountData, DirectSecp256k1Wallet } from '@cosmjs/proto-signing';

install();

export default function Wallet() {
  const [origin, setOrigin] = useState<string>('');
  const [wallet, setWallet] = useState<DirectSecp256k1Wallet>();
  const [accounts, setAccounts] = useState<AccountData>();
  const sourceCode = useInjectedSourceCode();

  useEffect(() => {
    const fileDir = resolveAssetsPath('webroot');

    let server: null | Server = new Server({
      fileDir,
      hostname: '127.0.0.1', // This is just the local loopback address.
      port: 3000,
      stopInBackground: true,
      errorLog: {
        conditionHandling: true,
        fileNotFound: true,
        requestHandling: true,
        requestHeader: true,
        requestHeaderOnError: true,
        responseHeader: true,
        timeouts: true,
      },
      // extraConfig: `
      //   server.modules += ("mod_expire")
      //   expire.url = ("" => "access plus 1 seconds")
      // `,
    });
    const serverId = server.id;

    (async () => {
      if (Platform.OS === 'android') {
        let extract = true;
        try {
          const versionD = await readFile(`${fileDir}/version`, 'utf8');
          const versionA = await readFileAssets('webroot/version', 'utf8');
          if (versionA === versionD) {
            extract = false;
          } else {
            await unlink(fileDir);
          }
        } catch {
          // A legit error happens here if assets have not been extracted
          // before, no need to react on such error, just extract assets.
        }
        if (extract) {
          console.log('Extracting web server assets...');
          await copyFileAssets('webroot', fileDir);
        }
      }

      server?.addStateListener((newState, details, error) => {
        console.log(
          `Server #${serverId}.\n`,
          `Origin: ${server?.origin}\n`,
          `New state: "${STATES[newState]}".\n`,
          `Details: "${details}".`,
        );
        if (error) console.error(error);
      });
      const res = await server?.start();
      if (res && server) {
        setOrigin(res);
      }
    })();
    return () => {
      (async () => {
        // In our example, here is no need to wait until the shutdown completes.
        server?.stop();

        server = null;
        setOrigin('');
      })();
    };
  }, []);

  const webView = useRef<WebView>(null);

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

      const result = await wallet?.signDirect(signerAddress, parsedSignDoc)
      webView.current?.postMessage(JSON.stringify(result, (key, value) =>
        typeof value === "bigint" ? value.toString() + "n" : value
      ));
    } catch (error) {
      webView.current?.postMessage(JSON.stringify(error));
    }
  }

  return (
    <View style={styles.webview}>
      <WebView
        ref={webView}
        source={origin ? { uri: origin } : { html: '' }}
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
