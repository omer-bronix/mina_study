import { fetchAccount, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { Square } from './Square.js';

const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Network);

// COPY ADDRESSES FROM KEYS FOLDER
const zkAppAddress = '';
const senderPrivateKeyBase58 = '';

// init zkapp instance
const zkAppPublicKey = PublicKey.fromBase58(zkAppAddress);
const zkApp = new Square(zkAppPublicKey);
await fetchAccount({ publicKey: zkAppPublicKey });

// init sender wallet information (in a website appliaction this will be obtained from your end users)
const senderPrivateKey = PrivateKey.fromBase58(senderPrivateKeyBase58);
const senderPublicKey = senderPrivateKey.toPublicKey();

// wait for the square instance to be compiled before sending transaction
await Square.compile();

// create, prove, sign and send transaction

const txn = await Mina.transaction(
  { sender: senderPublicKey, fee: 0.1e9 },
  () => {
    zkApp.update(Field(2));
  }
);
await txn.prove();
const sentTxn = await txn.sign([senderPrivateKey]).send();
console.log('https://berkeley.minaexplorer.com/transaction/' + sentTxn.hash);
