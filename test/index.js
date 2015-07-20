var bitcoin = require('../src/bitcoin.js');
var commonBlockchain = require('blockcypher-unofficial')({
  network: "testnet"
});

var test = require('tape');
var testCommonWallet= require('../');
var commonWalletTests = require('abstract-common-wallet/tests');


var randWIF = bitcoin.generateRandomWIF("testnet");
var randAddress = bitcoin.getAddressFromWIF(randWIF);


var commonWallet = testCommonWallet({
  network: "testnet",
  commonBlockchain: commonBlockchain,
  address: randAddress,
  wif: randWIF
});

var common = {
  setup: function(t, cb) {
    cb(null, commonWallet);
  },
  teardown: function(t, commonWallet, cb) {
    cb();
  }
}

commonWalletTests(test, common);