const bip39 = require('bip39');
const ecc = require('tiny-secp256k1')
const bitcoin = require('bitcoinjs-lib');
const { BIP32Factory } = require('bip32');

const bip32 = BIP32Factory(ecc)
// const ECPair = ECPairFactory(ecc);

// 生成助记词
const mnemonic = ""//bip39.generateMnemonic();

// 解码助记词为种子
const seed = bip39.mnemonicToSeedSync(mnemonic);
// console.log(seed.toString('hex'))
// 从种子生成根HD节点
const root = bip32.fromSeed(seed)

// 派生子节点
let path = "m/86'/0'/0'/0/"
const network = bitcoin.networks.bitcoin
if (network == bitcoin.networks.testnet) {
    path = "m/44'/0'/0'/0/"
} else if (network == bitcoin.networks.regtest) {

}

for (let i = 0; i < 4; i++) { 
    path = path+ i.toString()
    const child = root.derivePath(path)
    let pri = child.privateKey.toString('hex') //buffer
    let pub = child.publicKey.toString('hex') //buffer 
    console.log('\n',i)
    console.log("pri", pri)
    console.log("pub", pub)
    //1AQn3sX73KzTBJLZ8HDiabUcwXaCgfxhwT
    //testnet: mo3GYGHB8jWY2QVb9SemDkagG5KuuGnRRc
    const p2pkh = bitcoin.payments.p2pkh({ pubkey: child.publicKey, network });
    console.log("p2pkh", p2pkh.address)

    // bc1qvuuym7524n0t3tz5hy3e0cgxyn2a598wmywwgj
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network });
    console.log("p2wpkh", p2wpkh.address)

    const toXOnly = pubKey => (pubKey.length === 32 ? pubKey : pubKey.slice(1, 33));
    bitcoin.initEccLib(ecc);
    const internalPubkey = toXOnly(child.publicKey)
    //bc1pc64nk79kugaewg7ca7a0a0qgkgrvruhpkd6julvjx2qfu6vty0qq4wp9dx
    const p2tr = bitcoin.payments.p2tr({
        internalPubkey,
        network
    });
    console.log("p2tr", p2tr.address)
}
