## test common wallet

A test Common Wallet object for testing software written to the commonWallet spec.

## Inputs

Note common wallet relies on a common blockchain client which can be found <a href="https://github.com/blockai/abstract-common-blockchain/blob/master/README.md">here</a>
A common wallet instance can be instantiated as follows:

```javascript
var cw = require('test-common-wallet')({
  network: (network you want to operate on. "testnet" or "mainnet"),
  wif: (your private key in wif format to sign messages and transactions),
  commonBlockchain: (a Common Blockchain client. Read about this in the link above)
});
```

or 

```javascript
var cw = require('test-common-wallet')({
  network: (network you want to operate on. "testnet" or "mainnet"),
  seed: (a seed to generate a wif ie: "this is a seed"),
  commonBlockchain: (a Common Blockchain client. Read about this in the link above)
});
```


## Functions

```javascript
//callback should be of the form (err, response)
cw.signMessage("hey there, this is a message", callback);

//this callback should be of the form (err, signedTxHex, txid)
cw.signTransaction((some unsigned transaction hex to sign), callback);

//will create, sign, and (optionally) propagate a transaction. callback should be of (err, response)
cw.createTransaction({
  value: (the amount of btc to be transacted in satoshi),
  destinationAddress: (the address your Common Wallet object will be sending btc to),
  propagate: (true or false if you want to propagate the tx. Will default to false)
}, callback);

//will authenticate with host using wallet address as id
cw.login(host, function(err, res, body) {
  
});

//wraps npm request module with wallet authentication with host, use login() first
cw.request(options, function(err, res, body) {

});
```

## Authentication

Use [```express-common-wallet```](https://github.com/blockai/express-common-wallet) middleware with ```login()``` and ```request()``` functions.

## Other Common Wallet Data

In addition to the three functions listed above, a common wallet object will also have these two fields:

```
  address: (the public address of the wallet)
  network: (the network the wallet is operating on)
```