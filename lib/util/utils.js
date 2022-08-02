// const {
//     default: makeWASocket,
//     MessageType
// } = require('@adiwajshing/baileys')
const FS = require('fs')
const axios = require('axios')
const logo = FS.readFileSync(__dirname + '\\logo.jpg')

const phoneNumberFormatter = function(number) {
    // 1. Menghilangkan karakter selain angka
    let formatted = number.replace(/\D/g, '');

    // 2. Menghilangkan angka 0 di depan (prefix)
    //    Kemudian diganti dengan 62
    if (formatted.startsWith('0')) {
        formatted = '62' + formatted.substr(1);
    }

    if (!formatted.endsWith('@c.us')) {
        formatted += '@c.us';
    }

    return formatted;
}

function nFormatter(num, digits = 1) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

/*
 * Tests
 */

function left(teks, n, ext = '...') {
    if (n > 3) {
        return (teks.length <= n) ?
            teks.padEnd(n, ' ') : teks.slice(0, n - 3) + ext;
    } else return teks;

}

function log(msg) {
    console.log(msg)
}

function toID(id) {
    return id.split('@')[0]
}

const streamToBase64 = (stream) => {
    const concat = require('concat-stream')
    const { Base64Encode } = require('base64-stream')

    return new Promise((resolve, reject) => {
        const base64 = new Base64Encode()

        const cbConcat = (base64) => {
            resolve(base64)
        }

        stream
            .pipe(base64)
            .pipe(concat(cbConcat))
            .on('error', (error) => {
                reject(error)
            })
    })
}

class MatKul {
    constructor(nama, objek = []) {
        this.nama = nama;
        this.objek = objek;
    }
    sort(bool = true) {
        var sort = []
        for (var i in this.objek) { sort.push([this.objek[i].nim, this.objek[i].nama]) }
        sort.sort((a, b) => { return a[0] - b[0] })
        let newObj = [];
        sort.forEach(x => newObj.push({ nim: x[0], nama: x[1] }))

        if (bool) this.objek = newObj;
        else return newObj;
    }

    textToObj(daftar, bool = false) {
        var Daftar = daftar.trim().split('\n')
        let arr = []
        Daftar.forEach(x => {
            let split = x.split(' ')
            let nim = split[0].trim()
            let nama = split.slice(1).join(' ').trim()
            arr.push({ nim: nim, nama: nama })
        })
        if (bool) this.objek = arr;
        else return arr;
    }

    addMatkul(objek, pesan, file = './lib/matkul.json') {
        objek[this.nama] = this.objek
        fs.writeFileSync(file, JSON.stringify(objek, null, 2), 'utf8')
        pesan.reply('Berhasil ditambah :D')
    }
    addOrang(daftar, daftarMatkul) {
        return daftarMatkul.concat(this.textToObj(daftar))
    }
    shuffle(bool = true) {
        let keys = Object.keys(this.objek)
        var newObj = [];
        keys.sort((x, y) => { return Math.random() - 0.5 })
        keys.forEach(x => newObj.push(this.objek[x]))
        if (bool) this.objek = newObj;
        else return newObj;
    }
    tampilkan(options = false) {
        if (options[1]) this.shuffle()
        else this.sort()
        let m = options[0];
        let data = this.objek;
        let a = [];
        let text = '';
        for (let i = 0; i < m; i++) {
            a[i] = Math.floor(data.length / m);
            if (i < data.length % m) a[i] += 1
        }
        console.log(a)
        let awal = true;
        let j = 0,
            sum = a[0];
        log(data)
        for (let i = 1; i <= data.length; i++) {
            if (awal) {
                //console.log(1)
                text += `Kelompok ${j+1} : \n`
                awal = false
            }

            text += `\u25E6 ${data[i-1]['nama']}\n`
            if (i >= sum) {
                //console.log(3)
                awal = true;
                j++;
                sum += a[j]
                text += '\n'
            }
        }
        return text
    }
}

class Pesan {
    constructor(msg, alfan) {
        this.alfan = alfan;
        this.msg = msg;
        this.type = Object.keys(msg.message)[0],
            this.body = msg.message.conversation || "",
            this.from = msg.key.remoteJid,
            this.author = msg.key.remoteJid,
            this.id = msg.key.id,
            this.hasMedia = undefined,
            this.hasQuotedMsg = undefined,
            this.isGroup = undefined,
            this.grup = undefined;
        if (this.hasQuotedMsg == true) {
            this.id = msg.message.extendedTextMessage.contextInfo.stanzaId
        }
        /**
         * get Quoted Message
         * @returns WAMessage
         */

        this.isGroup = (msg.participant == "") ? false : true;
        if (this.isGroup) {
            alfan.groupMetadata(this.from).then(async(res) => {
                this.grup = await res;
            })
            this.author = msg.participant
        }
        this.toBase64 = async function() {
            let al = await alfan.downloadMediaMessage(msg, { type: "stream" })

            let base64 = await streamToBase64(al)
            return base64
        }
        this.toBuffer = async function() {
            let buffer = Buffer.from(await this.toBase64(), 'base64')
            return buffer;
        }
        switch (this.type) {
            case image:
            case video:
            case audio:
            case sticker:
                this.hasMedia = true;
                this.body = (msg.message)[this.type].caption;
                break;
            case 'buttonsResponseMessage':
                this.body = (msg.message)[this.type].selectedDisplayText;
                break;
            case 'listResponseMessage':
                console.log(1)
                this.body = msg.message.listResponseMessage.title;
                break;
            case extendedText:
                this.hasQuotedMsg = (msg.message.extendedTextMessage.contextInfo) ? ((msg.message.extendedTextMessage.contextInfo.quotedMessage) ? true : false) : false;
                this.body = msg.message.extendedTextMessage.text;
                break;
        }
        this.body = this.body || "";

        //FUNCTION
        this.waitForMessage = async function(timeout, from = null) {
            return new Promise((resolve) => {
                setTimeout(resolve(false), timeout);
                alfan.on("chat-update", (chat) => {
                    if (chat.messages.length > 1) {
                        if (typeof from == "string") {
                            if ((message.participant || message.key.remoteJid) == from) {
                                resolve(chat.messages.first);
                            }
                        } else {
                            resolve(chat.messages.first);
                        }
                    }
                });
            });
        };
        this.reply = (pesan) => {
            alfan.sendMessage(this.from, pesan, text)
        };


    }

    async isAdmin() {
        this.grup = await this.alfan.groupMetadata(this.from)
        let admin = await this.grup.participants.filter(x => x.isAdmin).some(x => x.jid == this.author)

        // console.log(this.grup)
        if (await this.author == '6283848837064@s.whatsapp.net' || await this.author == '6281276790748@s.whatsapp.net' ||
            await this.author == '6282167405617@s.whatsapp.net' ||
            (await this.grup != undefined && admin)
        ) {
            return true
        }
        return false
    }
    async getQuotedMsg() {
        if (this.hasQuotedMsg == true) {
            // log(msg.message.extendedTextMessage) ;
            let context = this.msg.message.extendedTextMessage.contextInfo
            let quoteMSG = await this.alfan.loadMessage(this.from, context['stanzaId'])
            return quoteMSG
                // Object.keys(msg.message.extendedTextMessage.contextInfo.quotedMessage)
        } else return null
    }
    async getMedia() {
        let base64 = await this.toBase64();
        var Media = {
            data: base64,
            mimetype: (this.msg.message)[this.type].mimetype,
            filename: this.msg.key.id
        }
        return Media
            // log(Media)
            // var buf = Buffer.from(alfin, 'base64')
            // log(alfin)
            // balas(buf, sticker)                    
    }
    async ifMedia(res) {
        if (this.hasMedia) {
            res();
        } else {
            this.reply("Mohon kirimkan gambar lalu captionnya #stiker");
        }
    }
    async grupData() {
        let group = await this.alfan.groupMetadata(this.from);
        return group;
    }

    async adReply(string, to = this.from, author = this.author, log = logo, type = text, ) {
        await log
        const message = {
            text: string,
            contextInfo: {
                externalAdReply: {
                    title: 'Pesan ini dikirim oleh BOT',
                    body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                    thumbnail: log,
                    mediaUrl: 'https://www.instagram.com/alfanirsyadi_/',
                    sourceUrl: 'https://www.instagram.com/alfanirsyadi_/',
                    mediaType: 1,
                },
                mentionedJid: [author],
            }
        }
        setTimeout(async() => {
            this.alfan.sendMessage(to, message, type, { quoted: this.msg })
        }, 2000)
    }

    async adReplyMention(string, mention = mentions, to = this.from, author = this.author, log = logo, type = text, ) {
        await log
        const message = {
            text: string,
            contextInfo: {
                externalAdReply: {
                    title: 'Pesan ini dikirim oleh BOT',
                    body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                    thumbnail: log,
                    link: 'RedRhombus',
                    mediaType: 1,
                },
                mentionedJid: mention,
            }
        }
        setTimeout(async() => {
            this.alfan.sendMessage(to, message, type, { quoted: this.msg })
        }, 2000)
    }

    async getPhoto() {
        await logo
        let foto;
        try {
            let link = await this.alfan.getProfilePicture(this.from)
            const response = await axios.get(link, { responseType: 'arraybuffer' })
            foto = Buffer.from(response.data, "utf-8")
        } catch (error) {
            foto = logo;
        }
        await foto
        return foto
    }

    Title = async() => {
        let judul = await this.grupData();
        judul = await judul.subject
        return judul
    }

    async custom(string, obj = {}) {
        obj.title = (obj.title == undefined) ? 'Pesan ini dikirim oleh BOT' : obj.title;
        obj.to = obj.to || this.from;
        obj.body = obj.body || 'alfanBot-v2';
        obj.mentionedJid = obj.mentionedJid || [];
        await logo
        obj.thumbnail = obj.thumbnail || logo;
        log(obj)
        const message = {
            text: string,
            contextInfo: {
                externalAdReply: {
                    title: obj.title,
                    body: obj.body,
                    thumbnail: obj.thumbnail,
                    mediaUrl: 'https://www.instagram.com/alfanirsyadi_/',
                    sourceUrl: 'https://www.instagram.com/alfanirsyadi_/',
                    mediaType: 1,
                },
                mentionedJid: obj.mentionedJid
            }
        }
        setTimeout(async() => {
            await this.alfan.sendMessage(obj.to, message, text, { quoted: this.msg })
        }, 2000)
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async tunggu() {
        let kata = [
            'Sedang diproses beb', 'Bentar ya gan', 'Lagi diproses ngab',
            'Mohon menunggu', 'Harap bersabar ya bang'
        ]
        let n = kata.length
        await this.adReply(`\u231B _${kata[Math.floor(Math.random()*n)]}_`);
    }

    sendListMessage() {
        let menu_list = {
            title: list['title'],
            rows: []
        }

        menu_.forEach(x => {

        })
    }

    async getMentioned() {
        if (await this.msg.message.extendedTextMessage != null)
            return (await this.msg.message.extendedTextMessage.contextInfo.mentionedJid);
        return null;
    }



}

class hitung {
    constructor(word) {
        this.word = word
    }
    prob() {
        let arr = []
        let n;
        for (let i = 0; i < this.word.length; i++) {
            if (i == 0 || i == this.word.length - 1) n = 3
            else n = 5
            for (let j = 0; j < n; j++) {
                arr.push(i)
            }
        }
        return arr
    }

    get_random(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }


    gen() {
        let word = this.word.split('')
        let n = Math.floor(2 * word.length / 6);
        let peluang = this.prob(word),
            indeks;
        while (n) {
            indeks = this.get_random(peluang)
            if (word[indeks] != ' ') {
                peluang = peluang.filter(x => x != indeks)
                word[indeks] = '_'
                n--;
            }
        }
        return word.join(' ')
    }
}

'use strict';
const sharp = require('sharp');
const fs1 = require('fs')
    // var ytdl = require('ytdl-core');
const path = require('path');
const Crypto = require('crypto');
const { tmpdir } = require('os');
const ffmpeg = require('fluent-ffmpeg');
const webp = require('node-webpmux');
const fs = require('fs').promises;
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/**
 * Utility methods
 */
class Util {
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
    }

    static generateHash(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        /**
         * Sets default properties on an object that aren't already specified.
         * @param {Object} def Default properties
         * @param {Object} given Object to assign defaults to
         * @returns {Object}
         * @private
         */
    static mergeDefault(def, given) {
            if (!given) return def;
            for (const key in def) {
                if (!has(given, key) || given[key] === undefined) {
                    given[key] = def[key];
                } else if (given[key] === Object(given[key])) {
                    given[key] = Util.mergeDefault(def[key], given[key]);
                }
            }
            return given;
        }
        /**
         * Formats a image to webp
         * @param {MessageMedia} media
         * 
         * @returns {Promise&lt;MessageMedia>} media in webp format
         */
    static async formatImageToWebpSticker(media) {
        if (!media.mimetype.includes('image'))
            throw new Error('media is not a image');

        if (media.mimetype.includes('webp')) {
            return media;
        }

        const buff = Buffer.from(media.data, 'base64');

        let sharpImg = sharp(buff);
        sharpImg = sharpImg.webp();

        sharpImg = sharpImg.resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        });

        let webpBase64 = (await sharpImg.toBuffer()).toString('base64');

        return {
            mimetype: 'image/webp',
            data: webpBase64,
            filename: media.filename,
        };
    }

    /**
     * Formats a video to webp
     * @param {MessageMedia} media
     * 
     * @returns {Promise&lt;MessageMedia>} media in webp format
     */
    static async formatVideoToWebpSticker(media) {
        if (!media.mimetype.includes('video'))
            throw new Error('media is not a video');

        const videoType = media.mimetype.split('/')[1];
        const tempFile = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
        );

        const stream = new(require('stream').Readable)();
        const buffer = Buffer.from(
            media.data.replace(`data:${media.mimetype};base64,`, ''),
            'base64'
        );
        stream.push(buffer);
        stream.push(null);
        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .inputFormat(videoType)
                .on('error', reject)
                .on('end', () => resolve(true))
                .addOutputOptions([
                    '-vcodec',
                    'libwebp',
                    '-vf',
                    // eslint-disable-next-line no-useless-escape
                    'scale=\'iw*min(300/iw\,300/ih)\':\'ih*min(300/iw\,300/ih)\',format=rgba,pad=300:300:\'(300-iw)/2\':\'(300-ih)/2\':\'#00000000\',setsar=1,fps=10',
                    '-loop',
                    '0',
                    '-ss',
                    '00:00:00.0',
                    '-t',
                    '00:00:10.0',
                    '-preset',
                    'default',
                    '-an',
                    '-vsync',
                    '0',
                    '-s',
                    '512:512',
                ])
                .toFormat('webp')
                .save(tempFile);
        });

        const data = await fs.readFile(tempFile, 'base64');
        await fs.unlink(tempFile);

        return {
            mimetype: 'image/webp',
            data: data,
            filename: media.filename,
        };
    }

    /**
     * Sticker metadata.
     * @typedef {Object} StickerMetadata
     * @property {string} [name] 
     * @property {string} [author] 
     * @property {string[]} [categories]
     */
    /**
     * Formats a media to webp
     * @param {MessageMedia} media
     * @param {StickerMetadata} metadata
     * 
     * @returns {Promise&lt;MessageMedia>} media in webp format
     */
    static async formatToWebpSticker(media, metadata) {
            let webpMedia;
            if (media.mimetype.includes('image'))
                webpMedia = await this.formatImageToWebpSticker(media);
            else if (media.mimetype.includes('video'))
                webpMedia = await this.formatVideoToWebpSticker(media);
            else
                throw new Error('Invalid media format');
            if (metadata.name || metadata.author) {
                const img = new webp.Image();
                const hash = this.generateHash(32);
                const stickerPackId = hash;
                const packname = metadata.name;
                const author = metadata.author;
                const categories = metadata.categories || [''];
                const json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories };
                let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
                let exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);
                await img.load(Buffer.from(webpMedia.data, 'base64'));
                img.exif = exif;
                webpMedia.data = (await img.save(null)).toString('base64');
            }
            return webpMedia;
        }
        /**
         * Configure ffmpeg path
         * @param {string} path
         */
    static setFfmpegPath(path) {
        ffmpeg.setFfmpegPath(path);
    }

    static async mp4ToMp3(stream) {
        const tempFile = path.join(
            tmpdir(),
            `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`
        );

        await new Promise((cb) => {
            let command = ffmpeg({ source: stream })
            command.inputFormat('mp4')
            command.on('error', (err) => { return cb(err) })
            command.on('end', () => { return cb(null) })
            command.toFormat('mp3')
            command.save(tempFile);
        });

        const data = await fs.readFile(tempFile, 'base64');
        await fs.unlink(tempFile);
        return Buffer.from(data, 'base64');
    }
    static async yt(url) {

        var output = path.resolve(__dirname, 'video.mp4');

        var video = ytdl(url);
        video.pipe(fs1.createWriteStream(output));
        video.on('response', function(res) {
            var totalSize = res.headers['content-length'];
            var dataRead = 0;
            res.on('data', function(data) {
                dataRead += data.length;
                var percent = dataRead / totalSize;
                process.stdout.cursorTo(0);
                process.stdout.clearLine(1);
                process.stdout.write((percent * 100).toFixed(2) + '% ');
            });
            res.on('end', function() {
                process.stdout.write('\n');
                console.log(output)
                return output
            });
        });
    }


}
module.exports = Util;

// console.log(new Pesan()??

module.exports = { log, streamToBase64, toID, Pesan, MatKul, left, nFormatter, phoneNumberFormatter, hitung }