var bitcoinjs = require('bitcoinjs-lib');
var bitcoin = require('./bitcoin');

var simpleCommonWallet = function(options) {
  var commonBlockchain = options.commonBlockchain;
  var network = options.network;
  var wif = (options.wif) ? options.wif : bitcoin.WIFKeyFromSeed(options.seed, network);
  var address = bitcoin.getAddressFromWIF(wif, network);

  var signMessage = function (message, cb) {
    var key = bitcoinjs.ECKey.fromWIF(wif);
    var network = (network === "testnet") ? bitcoinjs.networks.testnet : null;
    cb(null, bitcoinjs.Message.sign(key, message, network).toString('base64'));
  };
  
  //callback (error, tx.to)
  var signRawTransaction = function(txHex, cb) {
    var tx = bitcoinjs.Transaction.fromHex(txHex);
    var key = bitcoinjs.ECKey.fromWIF(wif);
    tx.sign(0, key);
    var txid = tx.getId();
    cb(false, tx.toHex(), txid);
  };

  var createTransaction = function(opts, callback) {
    var value = opts.valueInBTC;
    var destinationAddress = opts.destinationAddress;
    commonBlockchain.Addresses.Unspents([address], function (err, addressesUnspents) {
      if(err && !addressesUnspents) {
        callback("error creating transaction: " + err, null);
        return;
      }
      var unspentOutputs = addressesUnspents[0];
      unspentOutputs.forEach(function(utxo) {
        utxo.txHash = utxo.txid;
        utxo.index = utxo.vout;
      });
    
      var signedTxHex;

      bitcoin.buildTransaction({
        sourceWIF: wif,
        destinationAddress: destinationAddress,
        amountForDestinationInBTC: value,
        network: network,
        rawUnspentOutputs: unspentOutputs,
        propagateCallback: (opts.propagate) ? commonBlockchain.Transactions.Propagate : null
      }, function (err, transaction) {
          callback(err, transaction);
      });
    });
  };

  var commonWallet = {
    network: network,
    signRawTransaction: signRawTransaction,
    signMessage: signMessage,
    address: address,
    createTransaction: createTransaction
  };

  return commonWallet;
};

module.exports = simpleCommonWallet;