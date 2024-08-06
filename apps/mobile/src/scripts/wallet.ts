
import {DirectSecp256k1Wallet} from '@cosmjs/proto-signing';
import * as bip39 from 'bip39';
import {BIP32Factory} from 'bip32';
import ecc from '@bitcoinerlab/secp256k1';

export async function getWallet(privateKey: string) {
  return DirectSecp256k1Wallet.fromKey(Buffer.from(privateKey, 'hex'), 'init');
}

const bip32 = BIP32Factory(ecc);

async function derivePath(mnemonic: string) {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = bip32.fromSeed(seed);
  const {publicKey, privateKey} = root.derivePath(`m/44'/118'/0'/0/0`);

  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey?.toString('hex'),
  };
}

export const generateWallet = async (mnemonic: string) => {
  if (mnemonic.split(" ").length < 12) throw new Error("need more words")

  const account = await derivePath(mnemonic);
  const wallet = await getWallet(account?.privateKey ?? "");
  return wallet;
}
