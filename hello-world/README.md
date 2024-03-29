# Hello World zkapp 

* This project contains a contract with an update method.

* The update method checks if the given state is equal to the on-chain state and if so, updates the on-chain state with its square.

* For Example: if the on-chain state value is 2 and 2 is given to the update method, it will update the on-chain value to 4.

* The example of how to interact with the contract you have deployed check => 
https://github.com/omer-bronix/mina_study/blob/develop/hello-world/contracts/src/interact.ts

* For more information on how to build, deploy or interact with your deployed contract, see the readme file inside the contracts folder: 
https://github.com/omer-bronix/mina_study/tree/develop/hello-world/contracts#readme


## Requirements

* Make sure you have the latest version of the zkApp CLI installed:

```bash
npm install -g zkapp-cli
```

* Make sure the aura wallet chrome extension is setup, and an account with Testnet Mina is linked.
** https://www.aurowallet.com/
** To request testnet mina: https://faucet.minaprotocol.com/?address=<YOUR_PUBLIC_ADDRESS>&?explorer=minaexplorer 