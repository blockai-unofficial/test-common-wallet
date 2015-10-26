var bitcoinjs = require('bitcoinjs-lib')
var bitcoin = require('./bitcoin')
var request = require('request')

var simpleCommonWallet = function (options) {
  var commonBlockchain = options.commonBlockchain
  var network = options.network
  var wif = (options.wif) ? options.wif : bitcoin.WIFKeyFromSeed(options.seed, network)
  var address = bitcoin.getAddressFromWIF(wif, network)

  var signMessage = function (message, cb) {
    var key = bitcoinjs.ECKey.fromWIF(wif)
    var network = (network === 'testnet') ? bitcoinjs.networks.testnet : null
    cb(null, bitcoinjs.Message.sign(key, message, network).toString('base64'))
  }

  // callback (error, tx.to)
  var signRawTransaction = function (txHex, cb) {
    var input = 0
    var options
    var _txHex
    if (typeof (txHex) === 'object') {
      options = txHex
      _txHex = options.txHex
      input = options.input || 0
    } else if (typeof (txHex === 'string')) {
      _txHex = txHex
    }
    var _tx = bitcoinjs.Transaction.fromHex(_txHex)
    var tx = bitcoinjs.TransactionBuilder.fromTransaction(_tx)
    var key = bitcoinjs.ECKey.fromWIF(wif)
    tx.sign(input, key)
    var builtTx = tx.build()
    var txid = builtTx.getId()
    cb(false, builtTx.toHex(), txid)
  }

  var createTransaction = function (opts, callback) {
    var value = opts.value
    var destinationAddress = opts.destinationAddress
    commonBlockchain.Addresses.Unspents([address], function (err, addressesUnspents) {
      if (err && !addressesUnspents) {
        callback('error creating transaction: ' + err, null)
        return
      }
      var unspentOutputs = addressesUnspents[0]
      unspentOutputs.forEach(function (utxo) {
        utxo.txHash = utxo.txid
        utxo.index = utxo.vout
      })

      bitcoin.buildTransaction({
        sourceWIF: wif,
        destinationAddress: destinationAddress,
        value: value,
        network: network,
        skipSign: opts.skipSign,
        rawUnspentOutputs: unspentOutputs,
        propagateCallback: (opts.propagate) ? commonBlockchain.Transactions.Propagate : null
      }, function (err, transaction) {
        callback(err, transaction)
      })
    })
  }

  var __hosts = {}

  var walletRequest = function (options, callback) {
    var host = options.host
    var path = options.path
    var url = host + path
    options.url = options.url || url
    var nonce = __hosts[host].nonce
    signMessage(nonce, function (err, signedNonce) {
      if (err) {
        // TODO
      }
      var headers = {
        'x-common-wallet-address': address,
        'x-common-wallet-network': network,
        'x-common-wallet-signed-nonce': signedNonce
      }
      options.headers = options.headers ? options.headers.concat(headers) : headers
      request(options, function (err, res, body) {
        __hosts[host] = {
          nonce: res.headers['x-common-wallet-nonce'],
          verifiedAddress: res.headers['x-common-wallet-verified-address']
        }
        callback(err, res, body)
      })
    })
  }

  var login = function (host, callback) {
    request({
      url: host + '/nonce',
      headers: {
        'x-common-wallet-address': address,
        'x-common-wallet-network': 'testnet'
      }
    }, function (err, res, body) {
      __hosts[host] = {
        nonce: res.headers['x-common-wallet-nonce']
      }
      callback(err, res, body)
    })
  }

  var commonWallet = {
    request: walletRequest,
    login: login,
    network: network,
    signRawTransaction: signRawTransaction,
    signMessage: signMessage,
    address: address,
    createTransaction: createTransaction
  }

  return commonWallet
}

module.exports = simpleCommonWallet
