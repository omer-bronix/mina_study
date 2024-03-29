import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import heroMinaLogo from "../../public/assets/hero-mina-logo.svg";
import arrowRightSmall from "../../public/assets/arrow-right-small.svg";
import ZkAppWorkerClient from "./zkappWorkerClient";
import { Field } from "o1js";

const ZKAPP_ADDRESS = "";

export default function Home() {
  const [textFieldValue, setTextFieldValue] = useState(0);
  const [state, setState] = useState({
    zkAppWorkerClient: null as null | ZkAppWorkerClient,
    currentNum: Field(0),
    zkAppInitialized: false,
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

  const initMinaAndContract = async () => {
    console.log("initialization started");
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
    console.log("initialization completed");
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
      return;
    }
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
      <div style={{ justifyContent: "center", alignItems: "center" }}>
        <br />
        <div className={styles.center} style={{ padding: 0 }}>
          <button
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
      {/* <div style={{ justifyContent: "center", alignItems: "center" }}>
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
          // disabled={state.creatingTransaction}
        >
          Send Transaction
        </button>
      </div> */}
    </>
  );
}
