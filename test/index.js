
// const axios = require('axios');

const fs = require('fs');
const mime = require('mime-types');
const Inscription = require("../inscription");
const mempoolJS = require("@mempool/mempool.js")

const { bitcoin: { transactions } } = mempoolJS({
    hostname: 'mempool.space'
});

(async () => {

    let txHashes = [
        "051984d19027f4197fe1e03b0f6d0751c6ed8a32fefb2815e07a022fba1aea23",
        "b3da1c31e1649edb159733eeba86a482b0c2d445aa5c5d4d0869e30e712fc119"
    ]
    let index = 0;
    for (const txid of txHashes) {
        const transactionRaw = await transactions.getTx({ txid });
        console.log(index++, "/", txHashes.length)
        const inscript = transactionRaw.vin[0].witness[1]
        let tx = new Inscription(txid, inscript);
        const isOrd = tx.isOrdinalGenesis()
        const type = tx.getContentType()
        const data = tx.getContentData()
        fs.writeFileSync(__dirname + '/tmp/' + txid.substring(0, 6) + "." + mime.extension(type), data, { flag: 'w' });

        console.log(`${isOrd} ${type}`)
    }
})();

// const fun = ()=>{ 
//     const wi=  Buffer.from(data, "hex")
//     var e = Buffer.from("0063036f7264", "hex");
//     console.log(wi.indexOf(e)+ e.length)
//   //   var t = Buffer.from("51", "hex"),
//   var o = Buffer.fromByteArray(t).replace(/\n/g, ""),
//   i = "data:".concat(n, ";base64,").concat(o),
//   }
//   fun()