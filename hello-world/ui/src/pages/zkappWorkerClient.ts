import { fetchAccount, PublicKey, Field } from "o1js";
import {
  WorkerFunctions,
  ZkAppWorkerRequest,
  ZkAppWorkerResponse,
} from "./zkAppWorker";

export default class ZkAppWorkerClient {
  worker: Worker;
  nextId: number;
  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (res: any) => void };
  };
  // promises: any

  constructor() {
    this.worker = new Worker(new URL("./zkAppWorker.ts", import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkAppWorkerResponse>) => {
      if (event.data.error) {
        // If the worker sends an error, reject the corresponding promise
        this.promises[event.data.id].reject(event.data.error);
      } else {
        // Otherwise, resolve the promise with the received data
        this.promises[event.data.id].resolve(event.data.data);
      }
      // Delete the promise from the tracking object in both cases
      delete this.promises[event.data.id];
    };
  }

  _call(fnc: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkAppWorkerRequest = {
        id: this.nextId,
        fn: fnc,
        args: args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }

  trial1() {
    return this._call("trial1", {});
  }
  trial2() {
    return this._call("trial2", {});
  }
  loadContract() {
    return this._call("loadContract", {});
  }
  setActiveInstanceToBerkeley() {
    return this._call("setActiveInstanceToBerkeley", {});
  }
  compileContract() {
    return this._call("compileContract", {});
  }
  fetchAccount(publicKey58: string): ReturnType<typeof fetchAccount> {
    const response = this._call("fetchAccount", { publicKey58: publicKey58 });
    return response as ReturnType<typeof fetchAccount>;
  }
  initZkappInstance(publicKey58: string) {
    return this._call("initZkappInstance", { publicKey58: publicKey58 });
  }
  async getCurrentNum(): Promise<Field> {
    const currentNum = await this._call("getCurrentNum", {});
    return Field.fromJSON(JSON.parse(currentNum as string));
  }
  createUpdateTransaction(newNumber: number) {
    return this._call("createUpdateTransaction", { newNumber: newNumber });
  }
  proveUpdateTransaction() {
    return this._call("proveUpdateTransaction", {});
  }
  async getTransactionJSON() {
    const result = await this._call("getTransactionJSON", {});
    return result;
  }
}
