const bitcoin = require('bitcoinjs-lib');
const { bitcoinAPI, } = require("../api");

(async () => {
    const privateKeyWIF = 'your-private-key-in-WIF-format';
    const sourceAddress = 'your-source-address';
    const destinationAddress = 'your-destination-address';
    const amountToSend = 0.001; // In BTC
    const feeRate = 20; // In satoshis per byte


    const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, bitcoin.networks.bitcoin);
    const publicKey = keyPair.publicKey.toString('hex');


    const utxos =""
    const tx = new bitcoin.TransactionBuilder(bitcoin.networks.bitcoin);
    let totalUtxoValue = 0;
    for (const utxo of utxos) {
        tx.addInput(utxo.txid, utxo.vout);
        totalUtxoValue += utxo.value;
    }
    const amountToSpend = Math.floor(amountToSend * 1e8);
    const change = totalUtxoValue - amountToSpend - (tx.__inputs.length + 2) * feeRate * 180;
    
    tx.addOutput(destinationAddress, amountToSpend);
    tx.addOutput(sourceAddress, change); // Send change back to the source address
    for (let i = 0; i < tx.__inputs.length; i++) {
        tx.sign(i, keyPair);
    }
    const rawTx = tx.build().toHex();
    console.log('Raw transaction:', rawTx);
})()

