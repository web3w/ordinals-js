const { bitcoinAPI } = require("../api");
//curl --data-binary '{"jsonrpc":"1.0","id":"1","method":"getnetworkinfo","params":[]}' http://testuser:afca590b1a1@172.16.100.106:18332/
    

(async()=>{
    const btcAPI = new bitcoinAPI()
    const list  = await btcAPI.getWalletList() 
    console.log(list) 

    const txList = await btcAPI.listTransactions('ord')

    console.log(JSON.stringify(txList,null,2))


    // const addrList = await btcAPI.listAddressGroupings('ord')

    // console.log(JSON.stringify(addrList,null,2))



    // const oo = await btcAPI.listUnspent('ord')
    // console.log(oo)



})()