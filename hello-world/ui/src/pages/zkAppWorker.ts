import { Field, Mina, PublicKey, Transaction, fetchAccount } from "o1js";
import { Square } from "../../../contracts/build/src";

const workerState = {
  // Square: null as null | typeof Square
  Square: null as null | typeof Square,
  zkApp: null as null | Square,
  transaction: null as null | Transaction,
};

const functions = {
  trial1: async (args: {}) => {
    console.log("start1");
    let sum = 0;
    for (let i = 0; i < 10000000000; i++) {
      sum += i;
    }
    console.log("end1");
    return sum;
  },
  trial2: async (args: {}) => {
    console.log("start2");

    let sum = 1;
    for (let i = 0; i < 10000000000; i++) {
      sum += i;
    }
    console.log("end2");
    return sum;
  },
  setActiveInstanceToBerkeley: async (args: {}) => {
    const BerkeleyNetwork = Mina.Network(
      "https://proxy.berkeley.minaexplorer.com/graphql"
    );
    Mina.setActiveInstance(BerkeleyNetwork);
  },
  loadContract: async (args: {}) => {
    const { Square } = await import("../../../contracts/build/src/Square.js");
    workerState.Square = Square;
  },
  compileContract: async (args: {}) => {
    await workerState.Square!.compile();
  },
  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    workerState.zkApp = new workerState.Square!(publicKey);
  },
  getCurrentNum: async (args: {}) => {
    const currentNum = workerState.zkApp!.num.get();
    return JSON.stringify(currentNum.toJSON());
  },
  createUpdateTransaction: async (args: { newNumber: number }) => {
    const txn = await Mina.transaction(() => {
      workerState.zkApp!.update(Field(args.newNumber));
    });
    workerState.transaction = txn;
  },
  proveUpdateTransaction: async (args: {}) => {
    await workerState.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return workerState.transaction!.toJSON();
  },
};

export type WorkerFunctions = keyof typeof functions;

export type ZkAppWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkAppWorkerResponse = {
  id: number;
  data: any;
  error: any;
};

if (typeof window !== "undefined") {
  addEventListener(
    "message",
    async (event: MessageEvent<ZkAppWorkerRequest>) => {
      let message = null as null | ZkAppWorkerResponse;
      try {
        const returnData = await functions[event.data.fn](event.data.args);
        message = {
          id: event.data.id,
          data: returnData,
          error: "",
        };
      } catch (e) {
        message = {
          id: event.data.id,
          data: null,
          error: e,
        };
      }

      postMessage(message);
    }
  );
}
