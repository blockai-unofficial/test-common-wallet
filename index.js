//options takes a commonBlockchain client, a public address, a wif, and a network.
function commonWallet(options){
  if(!options.commonBlockchain || !options.address || ! options.wif || !options.network){
    console.log("insufficient arguments for Common Wallet Object")
  }
  return(require("./src/commonWallet.js")(options));
}

module.exports = commonWallet;