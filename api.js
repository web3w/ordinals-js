
class BtcRpc {
    constructor(url) {
        this.url = "http://127.0.0.1:18443"
    }

    quickSort(array, field, desc = true) {
        let arr = []
        if (array.length <= 1) {
            return array;
        } else {
            arr = [...array]
        }
        let pivotIndex = Math.floor(arr.length / 2);
        let pivot = arr.splice(pivotIndex, 1)[0];
        let left = [];
        let right = [];
        for (var i = 0; i < arr.length; i++) {
            if (desc) {
                if (arr[i][field] > pivot[field]) {
                    left.push(arr[i]);
                } else {
                    right.push(arr[i]);
                }
            } else {
                if (arr[i][field] < pivot[field]) {
                    left.push(arr[i]);
                } else {
                    right.push(arr[i]);
                }
            }

        }
        return this.quickSort(left).concat([pivot], this.quickSort(right));
    }

    async rpc({ cmdMethod = {}, walletname = '' }) {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append('Authorization', 'Basic ' + btoa('test:testpwd'));

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: JSON.stringify(cmdMethod)
            };
            const url = walletname ? `${this.url}/wallet/${walletname}` : this.url
            console.log(url)
            const req = await fetch(url, requestOptions);
            return req.json();
        } catch (e) {
            console.log('error', e)
            throw e
        }
    }
}

class bitcoinAPI extends BtcRpc {

    // constructor() {
    //     // this.url = 'http://127.0.0.1:18443';
    //     // this.network = bitcoin.networks.bitcoin
    //     // if (this.network == bitcoin.networks.testnet) {
    //     //     this.url = 'http://127.0.0.1:18443'
    //     // } else if (this.network == bitcoin.networks.regtest) {
    //     //     this.url = "http://127.0.0.1:18443"
    //     // }
    // }

    async getWalletList() {
        let waList = {
            method: "listwallets",
        }
        let waInfo = await this.rpc({ cmdMethod: waList }).catch(err => {
            throw err
        });

        let waDir = {
            method: "listwalletdir",
        }
        let waDirInfo = await this.rpc({ cmdMethod: waDir }).catch(err => {
            throw err
        });
        return { waInfo, waDirInfo }
    }

    // bitcoin-cli -regtest -rpcwallet=test -generate 10

    async listUnspent(walletname) {
        let cmdMethod = {
            method: 'listunspent',
            params: []
        }
        return this.rpc({ cmdMethod, walletname }).catch(err => {
            throw err
        });
    }


    // bitcoin-cli  -rpcwallet=ord listaddressgroupings
    //  获取钱包所有地址和余额
    async listAddressGroupings(walletname) {
        let cmdMethod = {
            method: 'listaddressgroupings',
            params: []
        }
        return this.rpc({ cmdMethod, walletname }).catch(err => {
            throw err
        });
    }

    // bitcoin-cli  -rpcwallet=ord listreceivedbyaddress
    // 用于列出所有已经收到过资金的地址及其余额。该命令可以接受一个可选参数
    // 例如，"bitcoin-cli listreceivedbyaddress 1"将列出所有至少有1个确认的地址和余额。
    async listReceivedByAddress(walletname) {
        let cmdMethod = {
            method: 'listreceivedbyaddress',
            params: []
        }
        return this.rpc({ cmdMethod, walletname }).catch(err => {
            throw err
        });
    }

    async getAddressInfo(address) {
        let cmdMethod = {
            method: 'getaddressinfo',
            params: [address]
        }
        return this.rpc({ cmdMethod }).catch(err => {
            throw err
        });
    }


    /**
     * 获取钱包交易信息
     * @param tx_id
     * @returns {Promise<unknown>}
     */
    async getTransaction(tx_id) {
        let cmdMethod = {
            method: 'gettransaction',
            params: [tx_id]
        }
        return this.rpc({ cmdMethod }).catch(err => {
            throw err
        });
    }

    //bitcoin-cli  -rpcwallet=ord listtransactions
    async listTransactions(walletname) {
        let cmdMethod = {
            method: 'listtransactions',
            params: ["*", 3] //"category"字段的值为"send"
        }
        return this.rpc({ cmdMethod, walletname }).catch(err => {
            throw err
        });
    }

    async getBatchRawTransaction(txIds) {
        let _body = txIds.map(val => {
            return {
                method: 'getrawtransaction',
                params: [val, 1], //1 json 方式返回
                id: val
            }
        })
        return this.rpc(_body).catch(err => {
            throw err
        });
    }

    /* 组装交易 */
    async getVinInfo(walletname, vout) {
        let _vin = []
        let voutVal = 0
        for (const key in vout) {
            voutVal += Number(vout[key])
        }

        let unspentsAll = await this.listUnspent(walletname).catch(e => {
            throw e
        })
        // 未确认交易可能导致签名失败 -> 可能导致钱包余额不足
        // unspents = unspents.filter(val =>val.confirmations>6);
        let unspents = unspentsAll.filter(val => val.spendable && val.safe);

        unspents = this.quickSort(unspents, "amount")

        let isEnough = unspents.some(val => {
            if (val.amount > voutVal) {
                _vin.push({ txid: val.txid, vout: val.vout, address: val.address })
                return true
            } else {
                voutVal = Number(voutVal) - Number(val.amount)
                _vin.push({ txid: val.txid, vout: val.vout, address: val.address })
                if (voutVal * 1e9 <= 1) {
                    return true
                }
            }
        })
        if (isEnough) {
            return _vin
        } else {
            console.log("unspent not enough !")
            console.log(JSON.stringify(unspentsAll))
            throw new Error("unspent not enough !")
        }
    }

    async sendRawTx(rawTx) {
        const cmd = {
            "method": "sendrawtransaction",
            "params": [rawTx]
        }
        return this.rpc(cmd).catch(err => {
            throw err
        });
    }
}

class blockstreamAPI {
    constructor() {
        this.network = bitcoin.networks.bitcoin
        this.url = this.network == bitcoin.networks.bitcoin
            ? 'https://blockstream.info/api/'
            : 'https://blockstream.info/testnet/api/'
    }
    async getUTXO() {
        // https://blockstream.info/testnet/api/address/tb1p6gj304swwdryec5cr4k3v0k5qcxcn0hxw0dq2jpx3q75shjtjp4qs7ver5/utxo
        const url = this.url + `/address/${sourceAddress}/utxo`
        console.log(url);
        const data = await fetch(url);
        return data.json()
    }

    async getMempoolTx(txid) {
        //https://mempool.space/api/tx/051984d19027f4197fe1e03b0f6d0751c6ed8a32fefb2815e07a022fba1aea23
        const url = `https://mempool.space/api/tx/${txid}`
        console.log(url);
        const data = await fetch(url);
        return data.json()
    }
}




module.exports = { bitcoinAPI, blockstreamAPI };
