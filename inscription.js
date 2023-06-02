

module.exports = class Inscription {
    constructor(hash, witness1Str) {
        this.isGenesis = false;
        this.hash = hash;
        this.witness1Str = Buffer.from(witness1Str, 'hex')
        let rawWitness = this.witness1Str
        this.type = null;
        try {
            if (rawWitness[35] == 99 && rawWitness[37] == 111 && rawWitness[38] == 114 && rawWitness[39] == 100 && rawWitness[40] == 1 && rawWitness[41] == 1) {
                let length = rawWitness[42]
                this.contentType = ""
                for (let index = 0; index < length; index++) {
                    this.contentType += String.fromCharCode(rawWitness[43 + index])
                }
                this.contentStart = 44 + length;
                this.isGenesis = true;
            }
        } catch (error) {
            console.error(error)
        }
    }
    _getAllContent(existing, start_index) {
        let rawWitness = this.witness1Str
        let op_1 = rawWitness[start_index];
        if (op_1 > 0 && op_1 < 76) {  // The next opcode bytes is data to be pushed onto the stack
            existing = Buffer.concat([existing, rawWitness.slice(start_index + 1, rawWitness.length - 1)]);
        } else if (op_1 == 76) {
            existing = Buffer.concat([existing, rawWitness.slice(start_index + 2, rawWitness.length - 2)]);
        } else if (op_1 == 77) { // The next byte contains the number of bytes to be pushed onto the stack.
            let nb = rawWitness[start_index + 1] + (rawWitness[start_index + 2] * 255)
            let new_index = start_index + 5 + (nb);
            existing = Buffer.concat([existing, rawWitness.slice(start_index + 3, new_index)]);
            return (this._getAllContent(existing, new_index))
        }
        return existing;
    }

    isOrdinalGenesis = function () {
        return this.isGenesis;
    }

    getContentType = function () {
        return this.contentType;
    }

    getContentLength = function () {
        return this.contentLength;
    }

    getContentData = function () {
        return this._getAllContent(Buffer.alloc(0), this.contentStart);
    }

    getHash = function () {
        return this.hash;
    }

    //pathFile = './tests/' + this.getHash() + "." + mime.extension(this.contentType)
    // Inscription.prototype.contentToFile = function (pathFile) {
    //     fs.writeFileSync(pathFile, this.getContentData(), { flag: 'w' });
    // }
}
