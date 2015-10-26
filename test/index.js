var commonBlockchain = require('blockcypher-unofficial')({
  network: 'testnet'
})

var test = require('tape')
var testCommonWallet = require('../')
var commonWalletTests = require('abstract-common-wallet/tests')

var seed = 'test'

var commonWallet = testCommonWallet({
  network: 'testnet',
  commonBlockchain: commonBlockchain,
  seed: seed
})

var common = {
  setup: function (t, cb) {
    cb(null, commonWallet)
  },
  teardown: function (t, commonWallet, cb) {
    cb()
  }
}

commonWalletTests(test, seed, common)
