import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Linking, Platform, SafeAreaView, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { WebView } from 'react-native-webview';
import { install } from 'react-native-quick-crypto';
import { copyFileAssets, readFile, readFileAssets, unlink } from '@dr.pogodin/react-native-fs';
import Server, { STATES, resolveAssetsPath } from '@dr.pogodin/react-native-static-server';
import { generateWallet } from '../scripts/wallet';
import { MNEMONIC } from '@env';

install();

export default function Wallet() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  };

  const [origin, setOrigin] = useState<string>('');
  const [accounts, setAccounts] = useState();

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
      const [a] = await w.getAccounts();
      console.log("in wallet", a)
      setAccounts(a);
    })()
  }, [])

  return (
    <View style={styles.webview}>
      <WebView
        ref={webView}
        source={origin ? { uri: origin } : { html: '' }}
        javaScriptEnabled
        allowsInlineMediaPlayback
        injectedJavaScript={`
          if (window.ReactNativeWebView.injectedObjectJson()) {
            const accounts = JSON.parse(window.ReactNativeWebView.injectedObjectJson()).accounts;
            console.log(\"in webveiw - account \", accounts)
            console.log(\"in webveiw\", [{ ...accounts, pubkey: new Uint8Array( Object.keys(accounts.pubkey).map((key) => accounts.pubkey[key])) }])
            const signer = {
              getAccounts: async () => [{ ...accounts, pubkey: new Uint8Array( Object.keys(accounts.pubkey).map((key) => accounts.pubkey[key])) }]
            }
            window.initiaWebView = {
              getOfflineSigner: () => signer
            }
          }
        `}
        injectedJavaScriptObject={{ accounts }}
        webviewDebuggingEnabled
        cacheMode="LOAD_NO_CACHE"
        onMessage={(event: any) => {
          const message = event.nativeEvent.data;
          Alert.alert('Got a message from the WebView content', message);
        }}
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
