import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import heroMinaLogo from "../../public/assets/hero-mina-logo.svg";
import arrowRightSmall from "../../public/assets/arrow-right-small.svg";
import ZkAppWorkerClient from "./zkappWorkerClient";
import { Field } from "o1js";

const ZKAPP_ADDRESS = "B62qqXTBHo4yb3QoCdJg76Not8EHd4gsPSAog85fd3qGDbs491V6xU9";
let transactionFee = 0.1;

export default function Home() {
  const [textFieldValue, setTextFieldValue] = useState(0);
  const [transactionLink, setTransactionLink] = useState("");
  const [state, setState] = useState({
    zkAppWorkerClient: null as null | ZkAppWorkerClient,
    currentNum: Field(0),
    zkAppInitialized: false,
    feePayerPublicKey58: "",
    creatingTransaction: false,
  });

  async function timeout(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  useEffect(() => {
    initMinaAndContract();
  }, []);

  useEffect(() => {
    if (state.zkAppInitialized) {
      getFeePayerAccount();
    }
  }, [state.zkAppInitialized]);

  const initMinaAndContract = async () => {
    console.log("initialization started...");
    const zkAppWorkerClient = new ZkAppWorkerClient();
    await timeout(5);
    console.log("worker client created");

    await zkAppWorkerClient.setActiveInstanceToBerkeley();
    console.log("active mina instance set to berkeley");

    await zkAppWorkerClient.loadContract();
    console.log("contract loaded (import complete)");

    await zkAppWorkerClient.compileContract();
    console.log("contract compiled");

    await zkAppWorkerClient.initZkappInstance(ZKAPP_ADDRESS);
    console.log("zk app initialized");

    await zkAppWorkerClient.fetchAccount(ZKAPP_ADDRESS);
    console.log("zk app account fetched");

    setState({
      ...state,
      zkAppWorkerClient: zkAppWorkerClient,
      zkAppInitialized: true,
    });
    console.log("initialization completed!!!");
  };

  const getFeePayerAccount = async () => {
    console.log("fething fee payer public key...");
    const mina = (window as any).mina;
    if (mina === null) {
      console.log("no wallet found");
      return;
    }

    const accountPublicKey58: string = (await mina.requestAccounts())[0];
    console.log("public key 58 fetched");

    for (;;) {
      // try to fetch account
      const response = await state.zkAppWorkerClient!.fetchAccount(
        accountPublicKey58
      );
      // break loop if fetched
      const accountExists = response.error == null;
      if (accountExists) {
        break;
      }
      // if failed wait 5 seconds and try again
      await timeout(5);
    }

    setState({
      ...state,
      feePayerPublicKey58: accountPublicKey58,
    });
    console.log("fee payer public key fetched!!!");
  };

  const getCurrentValue = async () => {
    if (state.zkAppWorkerClient === null) {
      console.log("zk app not initated yet");
      alert("zk app initialization ongoing...");
      return;
    }
    const num = await state.zkAppWorkerClient.getCurrentNum();
    console.log(num);
    setState({
      ...state,
      currentNum: num,
    });
  };

  const onSendTransaction = async () => {
    if (state.zkAppWorkerClient === null) {
      console.log("zk app not initated yet");
      alert("zk app initialization ongoing...");
      return;
    }

    console.log("transaction sending...");
    setState({
      ...state,
      creatingTransaction: true,
    });

    await state.zkAppWorkerClient!.fetchAccount(state.feePayerPublicKey58);
    console.log("fee payer account fetched");

    await state.zkAppWorkerClient!.createUpdateTransaction(textFieldValue);
    console.log("transaction created");

    await state.zkAppWorkerClient!.proveUpdateTransaction();
    console.log("transaction proved");

    const transactionJSON = await state.zkAppWorkerClient!.getTransactionJSON();
    console.log("transaction json obtained");

    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: "",
      },
    });

    const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    setState({ ...state, creatingTransaction: false });
    setTransactionLink(transactionLink);
    console.log("transaction sent!!!");
  };

  const onPrint = () => {
    console.log(state);
  };

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <br />
      <div style={{ justifyContent: "center", alignItems: "center" }}>
        <div className={styles.center} style={{ padding: 0 }}>
          <button
            className={styles.card}
            onClick={() => {
              getCurrentValue();
            }}
            disabled={!state.zkAppInitialized}
          >
            Get Current Value
          </button>
          Current state in zkApp: {state.currentNum!.toString()}{" "}
        </div>
      </div>
      <br />
      <div style={{ justifyContent: "center", alignItems: "center" }}>
        <div className={styles.center} style={{ padding: 0 }}>
          Fee Payer Account: {state.feePayerPublicKey58}
        </div>
      </div>
      <br />
      <div style={{ justifyContent: "center", alignItems: "center" }}>
        <div className={styles.center} style={{ padding: 0 }}>
          <input
            type="number"
            placeholder="Enter some number"
            value={textFieldValue}
            onChange={(e) => {
              setTextFieldValue(parseInt(e.target.value));
            }}
          />
          <button
            className={styles.card}
            onClick={() => {
              onSendTransaction();
            }}
            disabled={!state.zkAppInitialized || state.creatingTransaction}
          >
            Send Transaction
          </button>
          View transaction: {transactionLink}{" "}
        </div>
      </div>
    </>
  );
}
