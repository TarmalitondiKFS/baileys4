const fs = require('fs')
const { Boom } = require('@hapi/boom')
const {
    default: makeWASocket,
    downloadMediaMessage,
    proto,
    generateWAMessageFromContent,
    AnyMessageContent,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    loadMessage,
    downloadContentFromMessage
} = require('../Baileys/')
const { getImage } = require('./tf.js')
const { Readable } = require('stream');


const P = require('pino')
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter')

const MAIN_LOGGER = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` })
const logger = MAIN_LOGGER.child({})
const Util = require('./util/helper.js')
logger.level = 'error'
const prefix = "#";
const aktif = ['aktif', 'enable', '1', 'true', 'on'];
const nonaktif = ['nonaktif', 'disable', '0', 'false', 'off'];

// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
// const { getAnalytics } = require("firebase/analytics");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyADByyC01u5BfDl50tkB2dnT8963rxaV4A",
    authDomain: "node-db-fb6ce.firebaseapp.com",
    projectId: "node-db-fb6ce",
    storageBucket: "node-db-fb6ce.appspot.com",
    messagingSenderId: "352488162285",
    appId: "1:352488162285:web:3f6bca586fdccef886dde4",
    measurementId: "G-8M0FRN1G23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const { where, getFirestore, collection, setDoc, getDoc, addDoc, doc } = require('firebase/firestore');
const { SocketAddress } = require('net')
const db = getFirestore(app);
const tabel_grup = 'grup_whatsapp'

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
// const analytics = getAnalytics(app);
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
var peta_grup = {};
const logo = fs.readFileSync(__dirname + '\\util\\logo.jpg')

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
            this.isGroup = msg.key.participant == null ? false : true,
            this.grup = undefined;
        if (this.isGroup) {
            this.author = msg.key.participant;
        }
        switch (this.type) {
            case 'imageMessage':
                this.body = msg.message.imageMessage.caption;
                break
            case 'extendedTextMessage':
                this.body = msg.message.extendedTextMessage.text;
                break
            case 'buttonsResponseMessage':
                this.body = msg.message.buttonsResponseMessage.selectedButtonId;
                break
        }
    }
}

class DataGrup {
    constructor(id = null, intro = "⚠️ $NAMA join the chat ⚠️\n\n=> intro new memb $NAMA", farewell = "⚠️ $NAMA leave the chat ⚠️\n\n=>Semoga kamu nyaman diluar sana", enable_farewell = false, enable_intro = false) {
        this.id = id
        this.intro = intro
        this.farewell = farewell
        this.enable_intro = enable_intro
        this.enable_farewell = enable_farewell
    }
    static fromJson(json) {
        this.id = json['id']
        this.intro = json['intro']
        this.farewell = json['farewell']
        this.enable_intro = json['enable_intro']
        this.enable_farewell = json['enable_farewell']
    }
    toJson() {
        return {
            id: this.id,
            intro: this.intro,
            farewell: this.farewell,
            enable_farewell: this.enable_farewell,
            enable_intro: this.enable_intro
        }
    }
}



const startSock = async() => {
    global.callUsers = []
    const { state, saveCreds } = await useMultiFileAuthState('sessions')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`WhatsApp - v${version.join('.')} ${isLatest ? '- Last version' : ''}`)

    const sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: true,
        auth: state,
    })

    async function sendMessage(id, teks, msg = null) {
        const templateButtons = [
            { index: 1, urlButton: { displayText: 'Follow me on Instagram!', url: 'https://instagram.com/alfanirsyadi_' } },
            { index: 2, urlButton: { displayText: 'Follow me on TikTok!', url: 'https://vt.tiktok.com/ZSdGAtUpD/' } },
        ]

        const templateMessage = {
            text: teks + "\n\nBot Owner : wa.me/6285172450022",
            footer: '> TensorMath.bot x Alfan Irsyadi',
            templateButtons: templateButtons,

            // mentions: ["6285172450022@s.whatsapp.net"]

        }

        await sock.sendMessage(id, templateMessage, { sendEphemeral: true, quoted: msg })
    }



    sock.ev.on('group-participants.update', async(data) => {
        console.log('--------------------------------')
        console.log('Grup Update')
        console.log('--------------------------------')
        console.log(data.id)
        const docRef = await doc(db, tabel_grup, data.id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return
        console.log(docSnap.data())
        peta_grup[data.id] = docSnap.data();

        let pesan;
        console.log(peta_grup[data.id])
        if (!peta_grup[data.id]) return
        if (data.action == 'add' && peta_grup[data.id].enable_intro) {
            pesan = peta_grup[data.id].intro
        } else if (data.action == 'remove' && peta_grup[data.id].enable_farewell) {
            pesan = peta_grup[data.id].farewell
        } else {
            return
        }

        let pesan_baru;
        console.log(pesan)
        data.participants.forEach(async(x) => {
            if (pesan.includes('$NAMA'))
                pesan_baru = replaceAll(pesan, '$NAMA', '@' + toID(x))
            else pesan_baru = pesan;
            console.log(pesan_baru)
            await sock.sendMessage(data.id, { text: pesan_baru, mentions: [x] })
            return
        })
    })

    sock.ev.on('messages.upsert', async m => {
        var msg = m.messages[0]
        console.log('msg')
        console.log('----------------------')
        console.log(msg)
        if (msg.message != undefined) {
            var pesan = new Pesan(msg, sock);

            if ((pesan.body).startsWith(prefix)) {
                console.log(pesan)
                var pesan_split = Array.apply(null, Array(6)).map((x, i) => x = (pesan.body).split('>>')[i])
                let option = pesan_split.findIndex(Object.is.bind(null, undefined))
                if (pesan_split[option - 1].trim().toLowerCase() != ' spasi') {
                    for (i in pesan_split) {
                        if (i == option) break
                        pesan_split[i] = pesan_split[i].trim()

                    }
                } else {
                    pesan_split[0] = pesan_split[0].trim()
                }



                var command = pesan_split[0].split(prefix)[1].toLowerCase()
                console.log(pesan_split)
                switch (command) {
                    case '2t':
                        await sock.sendMessage(pesan.from, { image: { url: 'https://cdn.dribbble.com/users/24078/screenshots/15522433/media/e92e58ec9d338a234945ae3d3ffd5be3.jpg?compress=1&resize=400x300' } })
                        break
                        // 6
                    case 'detect':
                        let detect_base64;
                        if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo &&
                            msg.message.extendedTextMessage.contextInfo.quotedMessage) {
                            let quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage
                            let img = await downloadContentFromMessage(quotedMessage, "image")
                            detect_base64 = await streamToBase64(img);


                        } else {
                            let al = await downloadMediaMessage(msg, { type: "stream" })
                            detect_base64 = await streamToBase64(al)
                        }
                        let buff = new Buffer.from(detect_base64, 'base64')
                        let prediksi = await getImage(buff)




                        // const stream = Readable.from(prediksi.toString());
                        // await sendMessage(pesan.from, "⚠️ WARNING ⚠️\n\n=>Gambar sedang di-proses")
                        await sock.sendMessage(pesan.from, {
                                image: prediksi,
                                footer: 'TensorMath.bot x Alfan Irsyadi',
                                jpegThumbnail: prediksi.toString('base64')
                            })
                            // await sock.sendMessage(pesan.from, { image: { stream: stream } }, { sendEphemeral: true, quoted: msg });
                        break
                        // 5. Profil
                    case 'profile':
                    case 'profiles':
                    case 'profil':
                        var profil = '*Owner Profiles:*\n\n' +
                            '_Muhammad Alfan Irsyadi Hutagalung_\n' +
                            '🏫 _Math\'19 USU_\n' +
                            '🔥 _Data Science Enthusiast | Programming Addict_\n' +
                            '🌱 _Currently Learning Artificial Intelligence_\n' +
                            '💻 _C/C++, Matlab, Python, Node.Js, R, Flutter, React_\n' +
                            '❤️ _Math, Computer, Logic, and Teaching_\n'

                        const templateButtons = [
                            { index: 1, urlButton: { displayText: 'Follow me on Instagram!', url: 'https://instagram.com/alfanirsyadi_' } },
                            { index: 2, urlButton: { displayText: 'Follow me on TikTok!', url: 'https://vt.tiktok.com/ZSdGAtUpD/' } },
                        ]

                        const templateMessage = {
                            text: profil,
                            footer: '# TensorMath.bot',
                            templateButtons: templateButtons,
                            mentions: ["6285172450022@s.whatsapp.net"]
                        }

                        const sendMsg = await sock.sendMessage(pesan.from, templateMessage, { sendEphemeral: true, quoted: msg })

                        // await sock.sendMessage(pesan.from, profil);
                        break
                        // 4. Profil Grup (contoh: #grup)
                        // Arg:
                        //  - daftar
                    case 'grup':
                        switch (pesan_split[1]) {
                            case 'daftar':
                                let grupBaru = new DataGrup(pesan.from);

                                // let coll = await collection(db, 'grup_whatsapp');
                                let ref = await doc(db, tabel_grup, pesan.from);
                                peta_grup[pesan.from] = grupBaru;
                                await setDoc(ref, await grupBaru.toJson());
                                await sock.sendMessage(pesan.from, { text: "*Grup telah terdaftar*" }, { quoted: msg })
                                break
                            case 'farewell':
                            case 'intro':

                                const docRef = doc(db, tabel_grup, pesan.from);
                                const docSnap = await getDoc(docRef);

                                if (docSnap.exists()) {
                                    var docs = docSnap.data();
                                } else {
                                    // doc.data() will be undefined in this case
                                    const buttons = [
                                        { buttonId: '#grup >> daftar', buttonText: { displayText: 'DAFTAR' }, type: 1 },
                                        { buttonId: '#profil', buttonText: { displayText: 'PROFIL' }, type: 1 }
                                    ]

                                    const buttonMessage = {
                                        text: "*⚠️ Grup Belum Terdaftar*\n>> Silahkan klik daftar",
                                        footer: '</ TensorMath.bot >',
                                        buttons: buttons,
                                        headerType: 1
                                    }

                                    //   const sendMsg = await sock.sendMessage(id, buttonMessage)
                                    return await sock.sendMessage(pesan.from, buttonMessage)
                                }

                                // farewell >> enable
                                // farewell >> disable
                                // intro >> enable
                                // intro >> disable                                
                                let dok = await doc(db, tabel_grup, pesan.from);
                                console.log(pesan_split[2].toLowerCase().trim())
                                if (aktif.includes(pesan_split[2].toLowerCase().trim())) {
                                    if (!docs.enable_intro || !docs.enable_farewell) {
                                        docs['enable_' + pesan_split[1]] = true;
                                    }
                                    await sendMessage(pesan.from, "⚠️ Warning ⚠️\n\nPesan " + pesan_split[1] + " sudah *aktif*");
                                    return await setDoc(dok, docs)
                                } else if (nonaktif.includes(pesan_split[2].toLowerCase().trim())) {
                                    if (docs.enable_intro || docs.enable_farewell) {
                                        docs['enable_' + pesan_split[1]] = false;
                                    }
                                    await sendMessage(pesan.from, "⚠️ Warning ⚠️\n\nPesan " + pesan_split[1] + " telah *nonaktif*");
                                    return await setDoc(dok, docs)
                                } else {
                                    docs[pesan_split[1]] = pesan_split[2];
                                }
                                peta_grup[pesan.from] = docs;

                                await setDoc(dok, docs)
                                await sendMessage(pesan.from, `✅ *Success* ✅\n\nPesan ${pesan_split[1]} telah *diubah*\n `)
                        }
                        break
                    case 'send':
                        console.log(__dirname)
                        fs.readdirSync(__dirname + '\\send\\').forEach(async(file) => {
                            let stik = await fs.readFileSync(__dirname + '\\send\\' + file, { encoding: 'base64' })
                            let mime = file.split('.')[1] == "png" ? 'image/png' : 'image/jpeg';
                            console.log(stik)
                            var Media = {
                                data: stik,
                                mimetype: mime,
                                filename: pesan.from
                            }

                            let meta = {};
                            meta.name = pesan_split[1] || "STIKER-ALFN-BOT";
                            meta.author = pesan_split[2] || "redRhombus";
                            var stiker = await Util.formatToWebpSticker(Media, meta);
                            let buffer = Buffer.from(stiker.data, 'base64')
                            await buffer;
                            await sock.sendMessage(pesan.from, { sticker: buffer })
                                // await sock.sendMessage(pesan.from, buff)                            
                        });
                        break
                        // 2. Stiker
                    case 'stiker':
                    case 'sticker':
                        var base64, mimetype, id = msg.key.id;
                        if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo &&
                            msg.message.extendedTextMessage.contextInfo.quotedMessage) {
                            let quotedMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage
                            let img = await downloadContentFromMessage(quotedMessage, "image")
                            base64 = await streamToBase64(img);
                            mimetype = quotedMessage.mimetype


                        } else {
                            let al = await downloadMediaMessage(msg, { type: "stream" })
                            base64 = await streamToBase64(al)
                            mimetype = msg.message.imageMessage.mimetype

                        }
                        // let buff = Buffer.from(base64, 'base64')
                        // let sticker = new Sticker(buff, {
                        //     pack: 'My Pack', // The pack name
                        //     author: 'Me', // The author name
                        //     type: StickerTypes.FULL, // The sticker type
                        //     categories: ['🤩', '🎉'], // The sticker category
                        //     id: '12345', // The sticker id
                        //     quality: 50, // The quality of the output file
                        //     background: '#000000' // The st
                        // })
                        // const buffer = await sticker.toBuffer()
                        // await console.log(base64)
                        var Media = {
                            data: base64,
                            mimetype: mimetype,
                            filename: id
                        }
                        console.log(Media)

                        let meta = {};
                        meta.name = pesan_split[1] || "TESTES";
                        meta.author = pesan_split[2] || "redRhombus";
                        var stiker = await Util.formatToWebpSticker(Media, meta);
                        let buffer = Buffer.from(stiker.data, 'base64')
                        await buffer;
                        await sock.sendMessage(pesan.from, { sticker: buffer })
                            // await sock.sendMessage(pesan.from, buff)
                        break
                    case 'who':
                    case 'hide':
                    case 'hidetag':
                    case 'hidden':
                    case 'tagsemua':
                        if (!pesan.isGroup) return
                        let grup = await sock.groupMetadata(pesan.from)
                        let admin = await grup.participants.filter(user => user.admin).some(user => user.id == msg.key.participant);
                        if (command == "who") {
                            let members = await grup.participants;
                            console.log(members)
                            let pertanyaan = pesan_split[1]
                            let answer;
                            if (!pertanyaan.includes('ganteng')) answer = members[Math.floor(Math.random() * members.length)].id
                            else answer = '6285163608030@s.whatsapp.net'
                            console.log(answer)
                            let text = "❓ *PERTANYAAN:*\n->\t" + pertanyaan + '\n\n⁉️ JAWABAN:\n\t-> @' + toID(answer)
                            await sock.sendMessage(pesan.from, { text: text, mentions: [answer] }, { quoted: msg })
                            return
                        }
                        if (admin || msg.key.fromMe) {
                            let string = "*Tag Semua Anggota Grup*\n\n";
                            contact = []
                            grup.participants.forEach((x, i) => {
                                let nomor = toID(x.id)
                                string += (i + 1) + '.   @' + nomor + '\n'
                                contact.push(x.id)
                            })
                            let judul = "string"
                            let isi = "";
                            let hide = ['hide', 'hidetag', 'hidden']
                            await logo
                            if (hide.includes(command)) isi = pesan_split[1]
                            else if (hide.includes(pesan_split[1])) isi = pesan_split[2]
                            console.log(isi)
                            if (isi !== "")
                                return sock.sendMessage(pesan.from, {
                                    text: "*Hide Tag*\n" + (isi ? 'Pesan: ' + isi : '') + '\n\n_Pesan ini dikirim oleh TensorMath.bot_\n',
                                    mentions: contact
                                }, { sendEphemeral: true, quoted: msg })


                            sock.sendMessage(pesan.from, {
                                text: string,
                                mentions: contact
                            }, { sendEphemeral: true, quoted: msg })
                        } else {
                            await sock.sendMessage(pesan.from, { text: "_Emang kamu admin ?_ :D" }, { sendEphemeral: true, quoted: msg })
                        }
                        break
                }
            }

        }
        // var pesan = new Pesan(msg, sock)
        // if (!msg.key.fromMe && m.type === 'notify') {
        //     console.log('replying to', m.messages[0].key.remoteJid)
        //         // await sock.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
        //         // await sock.sendMessage(msg.key.remoteJid, { text: 'test!' })
        // }


    })

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            if (new Boom(lastDisconnect.error).output.statusCode !== DisconnectReason.loggedOut) {
                startSock()
            } else {
                console.log('Connection closed.')
            }
        }
        if (update.connection !== undefined) {
            console.log(`[Connection] ${update.connection}.`)
        }
    })

    sock.ev.on('creds.update', saveCreds)
    return sock
}

startSock()