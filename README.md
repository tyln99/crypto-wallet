<!-- ABOUT THE PROJECT -->
# ZWallet Browser Extension 

An Ethereum wallet for your browser. 


<!-- GETTING STARTED -->
## INSTALLATION

Command line for building and running locally. 

1. Install NPM packages
   ```sh
   npm install
   ```
2. Build project
   - development mode
   ```sh
   yarn dev
   ```
   - production mode
   ```sh
   yarn build
   ```

3. Test
   - run test
   ```sh
   yarn test
   ```

   - run test and export coverage report
   ```sh
   yarn coverage
   ```
4. Extract documents
   - Install jsdoc (globally)
   ```sh
   npm install -g jsdoc
   ```
   - Install jsdoc (locally)
   ```sh
   npm install --save-dev jsdoc
   ```
   - Start extract
   ```sh
   jsdoc -r app -d documents
   ```
   - The documents will extract and put input [root]/documents folder
   - Go to documents folder and open index.html to see the report.
<br>
<hr>
<br>

## SETUP SENTRY
Add .env into your root folder

past REACT_APP_SENTRY_DNS=[sentry dns] into .env

<br>
<hr>
<br>

# <span style="color: #006AF5">DAPP APIS<span>
After you install ZWallet extension in your browser, when you open new tab in the browser, ZWallet will inject a window global (with name: zwallet) into webpage.
Then you can interact with ZWallet.

## <span style="color: #006AF5">APIS<span>
ZWallet use zwallet.request(args) method to wrap an RCP API
```javascript
window.zwallet.request({method:"", params:[]})
```

<br />

## <span style="color: #006AF5">Ethereum JSON-RPC Methods<span>
For the Ethereum JSON-RPC API, please see the Ethereum wiki (opens new window). Important methods from this API include:
- <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance" target="_blank">eth_getBalance</a>
- <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts" target="_blank">eth_accounts</a>
- <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call" target="_blank">eth_call</a>
- <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction" target="_blank">eth_sendTransaction</a>
- <a href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sign" target="_blank">eth_sign</a>

<br />

## <span style="color: #006AF5">Restricted Methods<span>
In this permissions system, each RPC method is either restricted or unrestricted. If a method is restricted, the caller must have the corresponding permission in order to call it.

<code>eth_requestAccounts</code>

**Description** \
Request that the user accounts, if doesn't has permission, popup request permission will appear 

**Returns** \
string[] - An array of a single, hexadecimal Ethereum address string.

**Example**
```javascript
zwallet.request({ method: 'eth_requestAccounts' })
```


<code>wallet_requestPermissions</code>

**Description** \
Request permissions for current domain 

**Returns** \
<a href="https://eips.ethereum.org/EIPS/eip-2255" target="_blank">Web3WalletPermission
</a>[] - An array of the caller's permissions.

**Example**
```javascript
zwallet.request({ 
   method: 'wallet_requestPermissions',
   params: [{ eth_accounts: {} }]
})
```


<code>wallet_getPermissions</code>

**Description** \
Requests the given permissions from the user 

**Returns** \
<a href="https://eips.ethereum.org/EIPS/eip-2255" target="_blank">Web3WalletPermission
</a>[] - An array of the caller's permissions.


**Example**
```javascript
zwallet.request({ method: 'wallet_getPermissions' })
```

<br />


## <span style="color: #006AF5">Unrestricted Methods<span>

<code>wallet_switchEthereumChain</code>

**Description** \
Creates a confirmation asking the user to switch to the chain with the specified chainId.  

**Returns** \
null

**Parameters** \
Array: \
    - chainId: string  // A 0x-prefixed hexadecimal string

**Example**
```javascript
zwallet.request({ 
    method: 'wallet_switchEthereumChain', 
    params: [{ chainId: '0x61' }] 
})
```
<br>

## <span style="color: #006AF5">Events</span>

<code>chainChanged</code> \
The zwallet provider emits this event when the currently connected chain changes.
```javascript
zwallet.on('chainChanged', handler: (chainId: string) => void);
```

<code>accountChanged</code> \
The zwallet provider emits this event when the currently account changes.
```javascript
zwallet.on('accountsChanged', handler: (address: string) => void);
```

<code>connect</code> \
The zwallet provider emits this event when it first becomes able to submit RPC requests to a chain
```javascript
zwallet.on('connect', handler: (connectInfo: ConnectInfo) => void);
```

<code>disconnect</code> \
The zwallet provider emits this event when background lost connection
```javascript
zwallet.on('disconnect', handler: (error: Error) => void);
```

## <span style="color: #006AF5">Third Party</span>
zwallet provider can use with third party libraries similar to Metamask
- <a href="https://web3js.readthedocs.io/en/v1.7.5/" target="_blank">web3.js</a>
- <a href="https://docs.ethers.io/v5/" target="_blank">ethers.js</a>

<p style="text-align: right"><a href="#top">Back to top</a></p>
