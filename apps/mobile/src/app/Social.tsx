import { useEffect } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import * as WebBrowser from "@toruslabs/react-native-web-browser";
import EncryptedStorage from "react-native-encrypted-storage";
import Web3Auth, {
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from "@web3auth/react-native-sdk";
import { getWallet } from '../scripts/wallet';

const scheme = "initiawallet";
const redirectUrl = `${scheme}://openlogin`;

const clientId =
  "BB4r8nM18ejVoe83BrhqIwAFR9SAHGFbRnn_HAcQ6JObimtHRS0QPmAjlvvgn6j7BUsnEaqfXGkfiWjBabpGBnQ";

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
  clientId,
  redirectUrl,
  network: OPENLOGIN_NETWORK.SAPPHIRE_MAINNET, // or other networks
});

export default function Social() {

  useEffect(() => {
    const init = async () => {
      await web3auth.init();
    };
    init();
  }, [])

  const login = async () => {
    try {
      if (!web3auth.ready) {
        console.log('Web3auth not initialized');
        return;
      }
    
      console.log('Logging in');
      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      });

      const wallet = await getWallet(web3auth.privKey)
      console.log('Logged in', web3auth.privKey, wallet.getAccounts());
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const logout = async () => {
    if (!web3auth.ready) {
      console.log('Web3auth not initialized');
      return;
    }

    console.log('Logging out');
    await web3auth.logout();
  };

  const getAccounts = async () => {
    const userInfo = web3auth.userInfo();
    console.log('Getting account', userInfo);
  };

  return (
    <View style={styles.webview}>
      <Text>Social</Text>
      
      <Button onPress={login} title='login' />
      <Button onPress={logout} title='logout' />
      <Button onPress={getAccounts} title='getAccounts' />
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
