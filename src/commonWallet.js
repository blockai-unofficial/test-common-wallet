var bitcoinjs = require('bitcoinjs-lib');
var bitcoin = require('./bitcoin');

var simpleCommonWallet = function(options) {
  var commonBlockchain = options.commonBlockchain;
  var address = options.address;

  var signMessage = function (message, cb) {
    var key = bitcoinjs.ECKey.fromWIF(options.wif);
    var network = (options.network === "testnet") ? bitcoinjs.networks.testnet : null;
    cb(null, bitcoinjs.Message.sign(key, message, network).toString('base64'));
  };
  
  //callback (error, tx.to)
  var signRawTransaction = function(txHex, cb) {
    var tx = bitcoinjs.Transaction.fromHex(txHex);
    var key = bitcoinjs.ECKey.fromWIF(options.wif);
    tx.sign(0, key);
    var txid = tx.getId();
    cb(false, tx.toHex(), txid);
  };

  var createTransaction = function(opts, callback) {
    var value = opts.valueInBTC;
    var destinationAddress = opts.destinationAddress;
    commonBlockchain.Addresses.Unspents([destinationAddress], function (err, addressesUnspents) {
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
        sourceWIF: options.wif,
        destinationAddress: destinationAddress,
        amountForDestinationInBTC: value,
        network: options.network,
        rawUnspentOutputs: unspentOutputs
      }, function (err, transaction) {
          callback(err, transaction);
      });
    });
  };

  var commonWallet = {
    network: options.network,
    signRawTransaction: signRawTransaction,
    signMessage: signMessage,
    address: address,
    createTransaction: createTransaction
  };

  return commonWallet;
};

module.exports = simpleCommonWallet;