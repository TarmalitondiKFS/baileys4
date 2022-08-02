const client = require('@adiwajshing/baileys'),
    fs = require('fs'),
    Util = require('./util/util.js'),
    fetch = require('node-fetch'),
    { exec } = require('child_process'),

    { URL } = require('url'),
    Jimp = require('jimp'),
    ytdl = require('ytdl-core'),
    multer = require('multer'),
    { drakorID } = require('./util/scrape'),
    ytSearch = require('yt-search'),
    axios = require('axios'),
    math = require('mathjs'),
    {
        log,
        streamToBase64,
        toID,
        Pesan,
        MatKul,
        left,
        nFormatter,
        phoneNumberFormatter,
        hitung
    } = require('./util/function.js'),
    {
        menu,
        linkDownload,
        keyword
    } = require('./util/menu.js'),
    {
        text,
        extendedText,
        contact,
        location,
        liveLocation,
        image,
        video,
        sticker,
        document,
        audio,
        product,
        quotedMsg,
        buttonsMessage
    } = client.MessageType,
    solenolyrics = require("solenolyrics"),
    { toCanvas } = require('./util/canvas.js'),
    { run } = require('./util/jdoodle.js'),
    { scan } = require('./util/ocr.js'),
    // gdrive = require('./gdrive.js'),
    { remove_bg } = require('./util/remove-bg.js'),
    wa = require('wolfram-alpha-node'),
    waApi = wa('R8HRHU-P5KYRREEH2');

const events = require('events')

let owner = '6281276790748@s.whatsapp.net'
var mathId = {}
var OTebak = {}
var timer = []

class CTebak {
    constructor(pesan, alfan) {
        this.pesan = pesan
        this.alfan = alfan
        this.from = pesan.from
        this.grup = {}
        this.grup[pesan.from] = {
            state: 0,
            player: [],
            jawaban: [],
            point: [],
            answered: []
        }

    }

    async mulai() {

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

        let judul = await this.pesan.grupData();
        judul = await judul.subject

        this.grup[this.from].state = 1
        let jawaban = word[Math.floor(Math.random() * word.length)]

        let soal = new hitung(jawaban).gen();


        while (this.grup[this.from].answered.includes(jawaban)) {
            jawaban = word[Math.floor(Math.random() * word.length)]
        }
        log(jawaban)

        let kalimat = '*' + soal + '*';
        let body = 'Diberikan waktu sebanyak 30 detik'
        await this.pesan.custom(kalimat, {
            title: 'TEBAK KATA by @alfanirsyadi_',
            body: body,
            thumbnail: foto
        })
        this.addJawaban(jawaban)
        this.addAnswered(jawaban)
        await this.pesan.delay(30000)

        if (await this.grup[this.from].state == 1) {
            timer = []
            kalimat = 'WAKTU HABIS'
            this.clearJawaban()
            await this.pesan.custom('*[JAWABAN]* ' + jawaban, {
                title: kalimat,
                body: judul,
                thumbnail: foto
            })
            this.grup[this.from].state = 1
        }

    }

    async addAnswered(jawaban) {
        this.grup[this.from].answered.push(jawaban)
        await this.update()
    }

    async init() {

        if (OTebak[this.from] != undefined)
            this.grup[this.from] = OTebak[this.from]
    }

    async addPoint(siapa, poin) {
        this.grup[this.from].point.forEach((x, i) => { if (x.id == siapa) x.skor += poin })
        await this.update()
    }

    async clearPoint() {
        this.grup[this.from].point = []
        await this.update()
    }

    async rank() {
        let ranking = await this.grup[this.from].point.sort((a, b) => {
            if (a.skor < b.skor) {
                return 1;
            }
            if (a.skor > b.skor) {
                return -1;
            }
            return 0;
        })
        await log(ranking)
        let string = '>>[ *KLASEMEN* ]<<\n\n';
        ranking.forEach((x, i) => {
            let simbol = ''
            if (i == 0) simbol = '🥇'
            else if (i == 1) simbol = '🥈'
            else if (i == 2) simbol = '🥉'
            string += (i + 1) + '. ( @' + toID(x.id) + ' ) [ ' + x.skor + ` point ]${simbol}\n`;
        })
        string += '\nWell done, everyone !!!'
        await this.pesan.custom(string, {
            title: 'Congrats!!!',
            body: 'TEBAK KATA v0.1 by @alfanirsyadi_',
            mentionedJid: this.grup[this.from].player
        })
    }

    async addPlayer(newPlayer, resp) {
        if (await this.grup[this.from].player.includes(newPlayer) == false) {
            log('newPlayer :' + newPlayer)
            await this.grup[this.from].player.push(newPlayer)
            await this.grup[this.from].point.push({ 'id': newPlayer, 'skor': 0 })
            await this.update()
            resp('_berhasil login..._')
        } else {
            resp('_Kamu sudah login..._')
        }
        // log('[MATEMATIKA - DAFTAR] '+this.grup[this.from])        
    }
    async show() {
        let string = '-- List Player --\n\n'
        this.grup[this.from].player.forEach((x, i) => {
            string += (i + 1) + '. @' + toID(x) + '\n';
        })
        return string;
    }

    async addJawaban(jawaban) {
        await this.grup[this.from].jawaban.push(jawaban)
        this.update()
    }

    clearJawaban() {
        this.grup[this.from].jawaban = []
        this.update()
    }

    clearPlayer() {
        this.grup[this.from].player = []
        this.update()
    }

    update() {
        OTebak[this.from] = this.grup[this.from]
    }
}

class matematika {
    constructor(pesan, alfan) {
        this.pesan = pesan
        this.alfan = alfan
        this.from = pesan.from
        this.grup = {}
        this.grup[pesan.from] = {
            state: 0,
            player: [],
            jawaban: []
        }

    }

    async mulai() {

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

        let judul = await this.pesan.grupData();
        judul = await judul.subject

        this.grup[this.from].state = 1
        let operasi = [' + ', ' - ']
        let a = Math.floor(Math.random() * 100);
        let b = math.floor(Math.random() * 100);
        let ekspresi = a + operasi[Math.floor(Math.random() * 2)] + b

        let kalimat = '*Berapa hasil dari ' + ekspresi + '*';
        let body = 'Diberikan waktu sebanyak 30 detik'
        await this.pesan.custom(kalimat, {
            title: 'MATH QUIZ by @alfanirsyadi_',
            body: body,
            thumbnail: foto
        })
        let jawabanMath = math.evaluate(ekspresi)
        this.addJawaban(jawabanMath.toString())

        await this.pesan.delay(15000)

        if ((await this.grup[this.from].jawaban).length != 0) {

            kalimat = 'WAKTU HABIS'
            await this.pesan.custom('*[JAWABAN]* ' + this.grup[this.from].jawaban, {
                title: kalimat,
                body: judul,
                thumbnail: foto
            })

            await this.clearJawaban()
        }

    }

    async init() {

        if (mathId[this.from] != undefined)
            this.grup[this.from] = mathId[this.from]
            // else log('gagal init')
            // log('[MATEMATIKA - init]')        
    }

    async addPlayer(newPlayer, resp) {
        if (!this.grup[this.from].player.includes(newPlayer)) {
            log('newPlayer :' + newPlayer)
            await this.grup[this.from].player.push(newPlayer)
            await this.update()
            resp('_berhasil login..._')
        } else {
            resp('_Kamu sudah login..._')
        }
        // log('[MATEMATIKA - DAFTAR] '+this.grup[this.from])        
    }
    async show() {
        let string = '-- List Player --\n\n'
        this.grup[this.from].player.forEach((x, i) => {
            string += (i + 1) + '. @' + toID(x) + '\n';
        })
        return string;
    }

    async addJawaban(jawaban) {
        await this.grup[this.from].jawaban.push(jawaban)
        this.update()
    }

    clearJawaban() {
        this.grup[this.from].jawaban = []
        this.update()
    }

    clearPlayer() {
        this.grup[this.from].player = []
        this.update()
    }

    update() {
        mathId[this.from] = this.grup[this.from]
    }
}

// Util.setFfmpegPath('./util/ffmpeg/bin/ffmpeg.exe')
const logo = fs.readFileSync('./util/logo.jpg')
const correct = fs.readFileSync('./src/correct.png')
const matkul = JSON.parse(fs.readFileSync('./lib/matkul.json'))
const truth = JSON.parse(fs.readFileSync('./lib/truth.json'))
const dare = JSON.parse(fs.readFileSync('./lib/dare.json'))
const word = JSON.parse(fs.readFileSync('./lib/word.json'))
const { initGrup, saveGrup, cekImg, img, User, anonym } = require('./util/db.js');

var statY = ['ya', 'yes', 'aktif', 'true']
var statN = ['tidak', 'no', 'nonaktif', 'false']
var fitur_grup = ['join', 'leave']

let prefix;

const express = require('express');
const ioS = require('socket.io')
const http = require('http')
const qrcode = require('qrcode');
const { EventEmitter } = require('stream');
const { has } = require('cheerio/lib/api/traversing');

const app = express();
const server = http.createServer(app);
const io = ioS(server)
const port = process.env.PORT || 2020;
const upload = multer({ dest: __dirname + '/uploads/images' });
app.use(express.static(__dirname + '/html'))
var host = [];
app.get('/newton-raphson', (req, res) => {
    res.sendFile(__dirname + '/html/biseksi.html')
    console.log(req.query.hai);
    console.log(req.protocol + '://' + req.get('host'));
})
app.get('/stiker', (req, res) => {
    res.sendFile(__dirname + '/html/upload.html')
})

let player = []


var sesi = '8030';

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

async function mulai(socket) {
    socket.emit('message', 'connecting...')
    const alfan = new client.WAConnection()
    alfan.version = [3, 3234, 9];
    alfan.logger.level = 'warn'
    alfan.on('qr', (qr) => {

        log('[SYSTEM] SCAN THIS QR CODE...')
        qrcode.toDataURL(qr, (err, res) => {
            socket.emit('qr', res)
            socket.emit('status', 'qr')
            socket.emit('message', 'Scan QR...')
        })
    });

    fs.existsSync(`./lib/${sesi}.json`) && alfan.loadAuthInfo(`./lib/${sesi}.json`)
    alfan.on('connecting', () => {
        log('Connecting...')
        socket.emit('status', 'Connecting')
        socket.emit('message', 'Mencoba menghubungkan...')
    })
    alfan.on('open', () => {
        log('Connected:)')
        socket.emit('status', 'Connected')
        socket.emit('message', 'Terhubung :D')
    })

    await alfan.connect({ timeoutMs: 30 * 1000 })
    fs.writeFileSync(`./lib/${sesi}.json`, JSON.stringify(alfan.base64EncodedAuthInfo(), null, '\t'))


    app.post('/upload', upload.single('photo'), async(req, res) => {
        let nomor = await alfan.isOnWhatsApp(phoneNumberFormatter(req.body.nomor))
        log(nomor)
        if (nomor != undefined) {
            if (req.file) {
                res.json({ "pesan": "stiker telah dikirim" });
            } else throw 'error';
            let meta = {};
            meta.name = "STIKER-ALFN-BOT";
            meta.author = "redRhombus";
            var image = await fs.readFileSync(req.file.path)
            let stiker = await Util.formatToWebpSticker({ data: await image.toString('base64'), mimetype: req.file.mimetype }, meta);
            let buff = Buffer.from(stiker.data, 'base64')
            await buff
            alfan.sendMessage(nomor.jid, buff, sticker)
            await fs.unlinkSync(req.file.path)
        } else {
            res.json({ "pesan": "nomor tidak terdaftar" })
        }

    });

    alfan.on('group-participants-update', async(res) => {

        var nama, foto, teks, group = await alfan.groupMetadata(res.jid),
            sapaan, notif, cek_img = await img(res.jid);
        await cek_img;
        var grup = await initGrup();

        // console.log(grup[res.jid])
        if (grup[res.jid] != undefined) {
            switch (res.action) {

                case 'remove':
                    sapaan = "farewell";
                    notif = 'leave'
                    break;

                case 'add':
                    sapaan = 'welcome';
                    notif = 'join'
                    break;

            }

            if (grup[res.jid]["fitur"]["notif-" + notif] == true)
                res.participants.forEach(async(x) => {

                    nama = await alfan.contacts[x].notify || 'Manusia yang gk bernama';
                    teks = grup[res.jid]["sapaan"][sapaan]
                    teks = teks.replaceAll("[nama]", '@' + toID(x)).replaceAll("[nama_grup]", group.subject);

                    await teks
                    await logo
                    try {
                        let link = await alfan.getProfilePicture(x)
                        const response = await axios.get(link, { responseType: 'arraybuffer' })
                        foto = Buffer.from(response.data, "utf-8")
                    } catch (error) {
                        foto = logo;
                    }
                    await foto
                    if (!cek_img) {
                        let message = {
                            text: teks,
                            contextInfo: {
                                externalAdReply: {
                                    title: sapaan + ', ' + nama,
                                    body: group.subject + '!!!',
                                    thumbnail: foto,
                                    sourceUrl: 'https://www.instagram.com/alfanirsyadi_/',
                                    mediaType: 1,
                                },
                                mentionedJid: [x],
                            }
                        }
                        alfan.sendMessage(res.jid, message, text)
                    } else {

                        let gambar = await toCanvas(nama, group.subject, foto, sapaan)
                        await gambar
                        await alfan.sendMessage(res.jid, gambar, image, { caption: teks, contextInfo: { mentionedJid: [x] } })
                    }

                })
        }


    })


    alfan.on('chat-update', async(mag) => {

        let gambar, buttons, buttonMsg, nomor;
        const xpAdd = Math.floor(Math.random() * 10) + 50;
        let user;
        var grup;
        if (!mag.hasNewMessage) return
        var msg = mag.messages.all()[0]
        if (!msg.message ||
            (msg.key && msg.key.remoteJid == 'status@broadcast')
            // msg.key.fromMe
        ) return

        var pesan = new Pesan(msg, alfan)
        var mtk = new matematika(pesan, alfan);
        await mtk.init()

        var tebak = new CTebak(pesan, alfan);
        await tebak.init()
            // console.log(pesan)
        if (await pesan.isGroup) {
            if (tebak.grup[pesan.from].player.includes(pesan.author)) {
                let arr = tebak.grup[pesan.from].jawaban;
                if (tebak.grup[pesan.from] != undefined && arr.includes(pesan.body.toLowerCase())) {
                    // await pesan.adReply('Selamat, jawaban anda Benar !!!');

                    await tebak.clearJawaban()
                    await correct
                    tebak.grup[pesan.from].state = 2
                    let poin = Math.floor(pesan.body.length / 3)
                    await pesan.custom('*[ Skor ]* @' + toID(pesan.author) + ' *(+' + poin + ')*', {
                        title: 'Selamat, jawaban anda benar!!!',
                        body: 'TEBAK KATA',
                        thumbnail: correct,
                        mentionedJid: [pesan.author]
                    })

                    await tebak.addPoint(pesan.author, poin)

                    log(timer)
                    await clearTimeout(30000)
                    timer = await []
                    log('2' + timer)
                }
            }
            if (mtk.grup[pesan.from].player.includes(pesan.author)) {
                if (mtk.grup[pesan.from] != undefined && mtk.grup[pesan.from].jawaban.includes(pesan.body)) {
                    log(1)
                    await pesan.adReply('Selamat, jawaban anda Benar !!!');
                    await mtk.clearJawaban()
                    await clearTimeout()
                }
            }
        }

        //function kirim
        function balas(mes, type) {
            alfan.sendMessage(pesan.from, mes, type, { quoted: msg })
        }
        user = new User(await pesan.author);
        await user.init();
        await user

        let anon = new anonym(await pesan.author)
        await anon
        await anon.init()
        prefix = user.prefix || "#";

        try {
            // log(msg.message[Object.keys(msg.message)[0]])
            if (pesan.body.startsWith('/')) {
                let argumen = pesan.body.toLowerCase()
                let perintah = argumen.split('/')
                log(anon)

                if (perintah[1].trim() == "daftar") {
                    await anon.daftar(async(resp, resolve) => {
                        log(resolve)
                        await pesan.adReply(resp);

                        if (resolve == 1) {

                            buttons = [
                                { buttonId: 'id1', buttonText: { displayText: '/search' }, type: 1 },
                                { buttonId: 'id2', buttonText: { displayText: '/skip' }, type: 1 },
                                { buttonId: 'id3', buttonText: { displayText: '/stop' }, type: 1 }
                            ]
                            buttonMsg = {
                                contentText: "Hi, Selamat menggunakan Bot Anonymous!!!",
                                footerText: 'Klik /search untuk mencari partner, klik /skip untuk skip dan klik /stop untuk memberhantikan percakapan',
                                buttons: buttons,
                                headerType: 1, // change for file type
                                // imageMessage: media.message.imageMessage // change for file type
                            }
                            await alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage)
                        }
                    })
                    log("Berhasil")
                } else if (anon.reg)
                    switch (perintah[1].trim()) {
                        case "search":
                            // await pesan.tunggu()
                            if (!anon.connected_to.includes("net")) {
                                await anon.search(async(resp) => {
                                    pesan.adReply('_Sedang mencari partner_')
                                    log(anon)
                                    if (anon.connected_to.includes("net")) {

                                        buttons = [
                                            { buttonId: 'id2', buttonText: { displayText: '/skip' }, type: 1 },
                                            { buttonId: 'id3', buttonText: { displayText: '/stop' }, type: 1 }
                                        ]
                                        buttonMsg = {
                                            contentText: "_Partner ditemukan_",
                                            footerText: 'klik /skip untuk skip dan klik /stop untuk memberhantikan percakapan',
                                            buttons: buttons,
                                            headerType: 1, // change for file type                                        
                                            // imageMessage: media.message.imageMessage // change for file type
                                        }
                                        await alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage, {
                                            contextInfo: {
                                                externalAdReply: {
                                                    title: 'Pesan ini dikirim oleh BOT',
                                                    body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                                                    thumbnail: log,
                                                    link: 'RedRhombus',
                                                    mediaType: 1,
                                                },
                                                mentionedJid: ['6281276790748@s.whatsapp.net'],
                                            }
                                        })
                                    }
                                })
                            } else {
                                pesan.adReply("_Anda sedang dalam obrolan_")
                            }

                            break
                        case "stop":
                            if (anon.connected_to.includes("net")) {
                                await pesan.adReply("_Partner telah mengakhiri percakapan_", anon.connected_to)
                                await pesan.adReply("_Anda telah mengakhiri percakapan_")
                            } else {
                                await pesan.adReply("_Anda telah berhenti mencari_")
                            }
                            await anon.stop()
                            buttons = [
                                { buttonId: 'id2', buttonText: { displayText: '/search' }, type: 1 },
                                { buttonId: 'id3', buttonText: { displayText: '/stop' }, type: 1 }
                            ]
                            buttonMsg = {
                                contentText: "_Terimakasih sudah menggunakan bot WhatsApp. jika anda ingin berDonasi, silahkan hubungi nomor berikut: @6281276790748_",
                                footerText: 'klik /search untuk mencari dan klik /stop untuk memberhantikan percakapan',
                                buttons: buttons,
                                headerType: 1, // change for file type                            
                                // imageMessage: media.message.imageMessage // change for file type
                            }
                            await alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage, {
                                contextInfo: {
                                    externalAdReply: {
                                        title: 'Pesan ini dikirim oleh BOT',
                                        body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                                        thumbnail: log,
                                        link: 'RedRhombus',
                                        mediaType: 1,
                                    },
                                    mentionedJid: ['6281276790748@s.whatsapp.net'],
                                }
                            })

                            break;
                        case "skip":
                            if (anon.connected_to.includes("net")) {
                                await pesan.adReply("_Partner telah mengakhiri percakapan_", anon.connected_to)
                                await pesan.adReply("_Anda telah mengakhiri percakapan_")
                            } else {
                                await pesan.adReply("_Anda telah berhenti mencari_")
                            }
                            await anon.stop()
                            if (!anon.connected_to.includes("net")) {
                                await anon.search(async(resp) => {
                                    // pesan.adReply(resp)
                                    log(anon)
                                    if (anon.connected_to.includes("net")) {

                                        buttons = [
                                            { buttonId: 'id2', buttonText: { displayText: '/skip' }, type: 1 },
                                            { buttonId: 'id3', buttonText: { displayText: '/stop' }, type: 1 }
                                        ]
                                        buttonMsg = {
                                            contentText: "_Partner ditemukan_",
                                            footerText: 'klik /skip untuk skip dan klik /stop untuk memberhantikan percakapan',
                                            buttons: buttons,
                                            headerType: 1, // change for file type

                                            // imageMessage: media.message.imageMessage // change for file type
                                        }
                                        await alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage, {
                                            contextInfo: {
                                                externalAdReply: {
                                                    title: 'Pesan ini dikirim oleh BOT',
                                                    body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                                                    thumbnail: log,
                                                    link: 'RedRhombus',
                                                    mediaType: 1,
                                                },
                                                mentionedJid: ['6281276790748@s.whatsapp.net'],
                                            }
                                        })
                                    }
                                })
                            } else {
                                pesan.adReply("_Anda sedang dalam obrolan_")
                            }

                            break
                    } else {
                        pesan.adReply("_Anda belum terdaftar_")
                    }

            } else if (await anon.connected_to != "" &&
                await pesan.isGroup != true &&
                await anon.connected_to != "searching" &&
                !pesan.body.startsWith('#')) {
                const tipe = Object.keys(msg.message)[0]
                    // const waMessage = await alfan.prepareMessage (anon.connected_to, msg.message[tipe], tipe)
                    // const content = this.generateForwardMessageContent(message, forceForward)
                const waMessage = alfan.prepareMessageFromContent(anon.connected_to, msg.message, {})
                setTimeout(function() { alfan.relayWAMessage(waMessage) }, 2000)

                // alfan.relayWAMessage (waMessage, { waitForAck: true })
                // alfan.sendMessage(anon.connected_to, msg.message)
            }
        } catch (err) {
            log(err)
        }

        try {
            if ((pesan.body).startsWith(prefix)) {
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

                perintah = pesan_split;

                if (command == 'daftar') {
                    if (!user.reg) {
                        await user.add(async(res) => {
                            await pesan.adReply('_anda telah terdaftar_');
                            buttons = [
                                { buttonId: 'id1', buttonText: { displayText: '#contoh' }, type: 1 },
                                { buttonId: 'id2', buttonText: { displayText: '#skip' }, type: 1 }
                            ]
                            buttonMsg = {
                                contentText: "Hi, Selamat menggunakan Bot ALFN!!!",
                                footerText: 'Klik #contoh untuk menampilkan contoh menu, dan klik #skip untuk skip',
                                buttons: buttons,
                                headerType: 1, // change for file type
                                // imageMessage: media.message.imageMessage // change for file type
                            }
                            await alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage)
                        })
                    } else {
                        pesan.adReply('_Anda sudah terdaftar_')
                    }
                } else if (!user.reg) {
                    balas("_Anda belum terdaftar_\nSilahkan daftar", text)
                } else {
                    let xp = [5000, 15000, 30000, 50000, 50000]
                    if (command != undefined && user.level != 5) {

                        await user.updateExp(user.exp + xpAdd, async(resp) => {

                        });
                        await user
                        if (user.exp >= xp[user.level - 1]) {
                            await user.updateLevel(user.level + 1, async(res) => {
                                // await pesan.adReply(res)
                            });
                            await user
                            await pesan.adReply('_Selamat, anda telah mencapai level ' + (user.level + 1) + '_')
                        }
                    }
                    let deskripsi =
                        '𝐘𝐨𝐮𝐫 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧\n' +
                        `>> Exp   : ${user.exp} / ${xp[user.level-1]} XP\n` +
                        `>> Level  : ${user.level}\n` +
                        `>> Account : ${user.account}\n\n` +
                        `𝐁𝐨𝐭 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧𝐬 𝐚𝐧𝐝 𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐬\n` +
                        `>> Version : 2.0.1\n` +
                        `>> User(s) : ${await user.count()}\n` +
                        `>> Group(s) : ${await user.nGrup()}\n` +
                        `>> Command(s) : 32\n` +
                        `>> Employee(s) : 1\n\n` +
                        `𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫\n` +
                        `>> Name : Alfan Irsyadi ( @6281276790748 )\n` +
                        `>> Loves    : Math, Logic, and Programming\n` +
                        `>> Hobbies : Coding, Teaching, and Studying\n` +
                        `>> From : oJv8LTU6PDZjjzbCG0ponB0sLluZEh4wJ49uMZ+9ao0=`;
                    switch (command) {

                        case "ping":
                            alfan.sendMessage(pesan.from, "HAI", text, { quoted: msg })
                            break;
                        case 'tes':
                            for (let i = 1; i <= 2; i++) {
                                setTimeout(function() {
                                    let buttons = [
                                        { buttonId: 'id2', buttonText: { displayText: '#contoh' }, type: 1 },
                                        { buttonId: 'id3', buttonText: { displayText: '#skip' }, type: 1 }
                                    ]
                                    let buttonMsg = {
                                        contentText: "_Hai, maaf sebelumnya. Kini ALFN-BOT sudah kembali dengan nomor baru. Dikarenakan nomor lama sudah diblokir atau diban oleh WhatsApp. :D. Terimakasih sudah menggunakan bot WhatsApp. jika anda ingin bertanya, silahkan hubungi nomor berikut: @6281276790748_",
                                        footerText: 'klik #contoh untuk contoh menu dan klik #skip untuk skip',
                                        buttons: buttons,
                                        headerType: 1, // change for file type                            
                                        // imageMessage: media.message.imageMessage // change for file type
                                    }
                                    alfan.sendMessage(pesan.from, buttonMsg.contentText, text, {
                                        contextInfo: {
                                            mentionedJid: ['6281276790748@s.whatsapp.net'],
                                        }
                                    })
                                    log('success mengirim pesan ke ', pesan.from)
                                }, 5000 * i)
                            }
                            break
                        case "bc":
                            require('events').EventEmitter.defaultMaxListeners = 100;
                            let bc = await user.bc()
                            for (x in bc) {
                                let penerima = bc[x].id
                                if (alfan.isOnWhatsApp(penerima)) {
                                    setTimeout(function() {
                                        let buttons = [
                                            { buttonId: 'id2', buttonText: { displayText: '#contoh' }, type: 1 },
                                            { buttonId: 'id3', buttonText: { displayText: '#skip' }, type: 1 }
                                        ]
                                        let buttonMsg = {
                                            contentText: "_Hai, maaf sebelumnya. Kini ALFN-BOT sudah kembali dengan nomor baru. Dikarenakan nomor lama sudah diblokir atau diban oleh WhatsApp. :D. Terimakasih sudah menggunakan bot WhatsApp. jika anda ingin bertanya, silahkan hubungi nomor berikut: @6281276790748_",
                                            footerText: 'klik #contoh untuk contoh menu dan klik #skip untuk skip',
                                            buttons: buttons,
                                            headerType: 1, // change for file type                            
                                            // imageMessage: media.message.imageMessage // change for file type
                                        }
                                        alfan.sendMessage(penerima, buttonMsg.contentText, text, {
                                            contextInfo: {
                                                mentionedJid: ['6281276790748@s.whatsapp.net'],
                                            }
                                        })
                                        log('success mengirim pesan ke ' + penerima)
                                        log(x)
                                    }, 2000 * (x + 1))

                                }
                            }
                            break;
                            // case "list":
                            //     const result = await gdrive.mulai()
                            //     var spasi = '',
                            //         hasil = '*DAFTAR NAMA MAHASISWA S1-MATEMATIKA STAMBUK 2019 YANG MENGAMBIL MATA KULIAH STATISTIKA PENGENDALIAN MUTU:*\n\n'
                            //     console.log(result)
                            //     result.forEach((x, i) => {

                            //         hasil += `${(i+1)}. (${x.nim}) ${x.nama} ${x.jk}\n`
                            //     })
                            //     pesan.custom(hasil)
                            //     break

                        case "sticker":
                        case "stiker":

                            if (pesan.hasQuotedMsg == true) {
                                pesan = new Pesan(await pesan.getQuotedMsg(), alfan);
                            }
                            pesan.ifMedia(async() => {
                                let meta = {};
                                meta.name = pesan_split[1] || "STIKER-ALFN-BOT";
                                meta.author = pesan_split[2] || "redRhombus";
                                var stiker = await Util.formatToWebpSticker(await pesan.getMedia(), meta);
                                let buff = Buffer.from(stiker.data, 'base64')
                                balas(buff, sticker)
                            })
                            break;
                        case "kirim":
                            let tujuan = phoneNumberFormatter(pesan_split[1])
                            if (await alfan.isOnWhatsApp(tujuan) != undefined) {
                                console.log(tujuan)
                                pesan.adReply("*Pesan anonymous dari seseorang:*\n" + pesan_split[2], tujuan)
                                pesan.adReply("[SUCCESS] Pesan Terkirim")
                            } else {
                                pesan.adReply("[FAILED] _Nomor tidak terdaftar di WhatsApp_")
                            }

                            break
                        case "welcome":
                            const buttons = [
                                { buttonId: 'id1', buttonText: { displayText: '#contoh' }, type: 1 },
                                { buttonId: 'id2', buttonText: { displayText: '#skip' }, type: 1 }
                            ]
                            const buttonMsg = {
                                contentText: "Hi, Selamat menggunakan Bot ALFN!!!",
                                footerText: 'Klik #contoh untuk menampilkan menu contoh, dan klik #skip untuk skip',
                                buttons: buttons,
                                headerType: 1, // change for file type
                                // imageMessage: media.message.imageMessage // change for file type
                            }
                            alfan.sendMessage(pesan.from, buttonMsg, buttonsMessage)
                            break;
                        case "tod":
                            const buttons1 = [
                                { buttonId: 'id1', buttonText: { displayText: '#truth' }, type: 1 },
                                { buttonId: 'id2', buttonText: { displayText: '#dare' }, type: 1 }
                            ]
                            const buttonMsg1 = {
                                contentText: "Hi, Selamat Memainkan Game T-O-D!!!",
                                footerText: 'Klik #truth untuk memilih truth, dan klik #dare untuk memilih tantangan',
                                buttons: buttons1,
                                headerType: 1, // change for file type
                                // imageMessage: media.message.imageMessage // change for file type
                            }
                            alfan.sendMessage(pesan.from, buttonMsg1, buttonsMessage)
                            break;
                        case 'truth':
                            let truth1 = truth[Math.floor(Math.random() * truth.length)]
                            await pesan.adReply('_' + truth1 + '_');
                            break;
                        case 'dare':
                            let dare1 = dare[Math.floor(Math.random() * dare.length)]
                            await pesan.adReply('_' + dare1 + '_');
                            break;
                        case 'menu':
                            let menu_info = {
                                title: 'Menu Bot',
                                rows: []
                            }
                            keyword.forEach(x => {
                                menu_info.rows.push({
                                    title: `*${prefix+x.fitur}*`,
                                    description: '\n*Deskripsi:* _' + x.deskripsi + '_\n*Parameter*: _' + x.parameter + '_\n',
                                    rowId: x.id
                                })
                            })
                            await alfan.sendMessage(pesan.from, {
                                buttonText: '✔ Klik aku ngab',
                                description: `${menu}\n\n${deskripsi}\n\nUntuk menampilkan menu, klik tombol dibawah ini`,
                                listType: 1,
                                sections: [menu_info],
                            }, 'listMessage', { quoted: msg })

                            break;
                            // case 'kirim':
                            //     let medi = '*Pesan Anonymous dari seseorang:*\n'+pesan_split[2];
                            //     pesan.adReply(medi, phoneNumberFormatter(pesan_split[1])); 
                            //     break
                        case 'tagsemua':

                            if (pesan.isGroup) {
                                if (await pesan.isAdmin()) {
                                    let grup = await pesan.grupData()
                                    let contact = [];
                                    let string = "*Tag Semua Anggota Grup*\n";
                                    let judul;
                                    if (pesan_split[1] == undefined) {
                                        judul = 'Fitur Tag Semua'
                                        grup.participants.forEach((x, i) => {
                                            if (x.id != undefined) {
                                                let nomor = toID(x.id)
                                                string += (i + 1) + '.   @' + nomor + '\n'
                                                contact.push(x.jid)
                                                i++;
                                            } else {
                                                console.log(x);
                                            }

                                        })
                                    } else if (pesan_split[1].toLowerCase() == 'hide') {
                                        let sapaan = 'HAI SEMUA ;)'
                                        judul = 'Fitur Hidden Tag'
                                        if (pesan_split[2] != undefined) sapaan = pesan_split[2]
                                        string =
                                            `Dari: @${toID(pesan.author)}\n` +
                                            `Pesan: ${sapaan}`;
                                        contact.push(pesan.author)
                                        grup.participants.forEach((x, i) => {
                                            contact.push(x.jid)
                                        })
                                    } else if (pesan_split[1].toLowerCase() == 'cek') {
                                        balas("Jumlah: " + grup.participants.length, text);
                                    } else {
                                        balas('Maaf, perintah tidak diketahui', text)
                                        return
                                    }

                                    const message = {
                                        text: string,
                                        contextInfo: {
                                            externalAdReply: {
                                                title: judul,
                                                body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                                                thumbnail: logo,
                                                link: 'RedRhombus',
                                                //   sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                                                mediaType: 1,
                                            },
                                            mentionedJid: contact,
                                        }
                                    }
                                    balas(message, text)
                                } else {
                                    pesan.reply('_Anda bukan admin_');
                                }

                            } else {
                                balas('Perintah ini hanya bisa digunakan di dalam grup ngab', text)
                            }
                            break;
                        case "bagi-kelompok":
                            if (pesan.isGroup) {
                                if (await pesan.isAdmin()) {
                                    let grup = await pesan.grupData()
                                    let contact = [];
                                    let nomor = []
                                    let mention = await pesan.getMentioned() || [0]
                                    let string = "*Tag Semua Anggota Grup*\n";
                                    let judul;

                                    judul = 'Bagi Kelompok menjadi ' + pesan_split[1]
                                    grup.participants.forEach((x, i) => {
                                        if (x.jid != undefined && !mention.includes(x.jid) && x.jid != "6285766300421@s.whatsapp.net") {
                                            nomor.push(x.id.split("@")[0])
                                                // string += (i+1) + '.   @' + nomor + '\n'
                                            contact.push(x.jid)
                                            i++;
                                        } else {
                                            log(x)
                                        }
                                    })

                                    m = pesan_split[1]
                                    let data = shuffle(nomor);
                                    let a = [];
                                    string = '';
                                    for (let i = 0; i < m; i++) {
                                        a[i] = Math.floor(data.length / m);
                                        if (i < data.length % m) a[i] += 1
                                    }
                                    console.log(a)
                                    let awal = true;
                                    let j = 0,
                                        sum = a[0];
                                    // log(data)
                                    for (let i = 1; i <= data.length; i++) {
                                        if (awal) {
                                            //console.log(1)
                                            string += `Kelompok ${j+1} : \n`
                                            awal = false
                                        }

                                        string += `\u25E6 @${data[i-1]}\n`
                                        if (i >= sum) {
                                            //console.log(3)
                                            awal = true;
                                            j++;
                                            sum += a[j]
                                            string += '\n'
                                        }
                                    }
                                    const message = {
                                        text: string,
                                        contextInfo: {
                                            externalAdReply: {
                                                title: judul,
                                                body: '𝐀𝐋𝐅𝐍-𝐁𝐎𝐓-𝐯𝟐',
                                                thumbnail: logo,
                                                link: 'RedRhombus',
                                                //   sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                                                mediaType: 1,
                                            },
                                            mentionedJid: contact,
                                        }
                                    }
                                    balas(message, text)
                                } else {
                                    pesan.reply('_Anda bukan admin_');
                                }

                            } else {
                                balas('Perintah ini hanya bisa digunakan di dalam grup ngab', text)
                            }

                            break;
                        case 'cek1':
                            const fck = fs.readFileSync('./fck.png');
                            meta = {};
                            meta.name = pesan_split[1] || "STIKER-ALFN-BOT";
                            meta.author = pesan_split[2] || "redRhombus";
                            stiker = await Util.formatToWebpSticker({ data: fck.toString('base64'), mimetype: "image/png" }, meta);
                            buff = Buffer.from(stiker.data, 'base64')
                            balas(buff, sticker)
                            break;
                        case "cek2":
                            log(await pesan.getMentioned())
                            break
                        case 'daftar-semua':
                            pesan.reply('*[PROCESSING]* _Mohon tunggu sebentar_ ⏱️')
                            if (pesan.isGroup) {
                                if (await pesan.isAdmin()) {
                                    let grup1 = await pesan.grupData()
                                    let j = [];
                                    let anggota = await grup1.participants
                                    banyak = anggota.length;
                                    // await grup1.participants.forEach(async (x)=>{


                                    // })
                                    for (let i = 0; i < banyak; i++) {
                                        peserta = anggota[i].jid;
                                        console.log(peserta)
                                        await user.addByID(peserta, async(s, k) => {
                                            // console.log(s);
                                            j.push(k);
                                            // console.log(k)
                                            if (i == banyak - 1) {
                                                let jumlah = 0;
                                                for (let i = 0; i < j.length; i++) {
                                                    jumlah += j[i];
                                                }
                                                if (jumlah != 0) {
                                                    await pesan.adReply(`*[SUCCESS]* _Berhasil mendaftarkan ${jumlah} anggota 😍_`);
                                                } else {
                                                    await pesan.adReply(`*[FAILED]* _Gagal mendaftarkan anggota 😔_`);
                                                }

                                            }
                                        })

                                    }
                                    await j;
                                    // await console.log(grup1.participants)


                                } else {
                                    pesan.reply('_Anda bukan admin_');
                                }

                            }
                            break;

                        case 'daftar-grup':
                            if (pesan.isGroup) {
                                const group = await alfan.groupMetadata(pesan.from)

                                let nama_gc = await group.subject

                                grup = await initGrup();
                                if (await pesan.isAdmin()) {
                                    if (grup[pesan.from] == undefined) {
                                        grup[pesan.from] = {
                                            jid: pesan.from,
                                            nama: nama_gc,
                                            regDate: new Date(),
                                            fitur: {
                                                "notif-join": false,
                                                "notif-leave": false
                                            },
                                            sapaan: {
                                                "welcome": "Hai [nama]!,Selamat datang di [nama_grup] :D.",
                                                "farewell": "Yah si anu keluar :("
                                            }
                                        }
                                        pesan.reply("```Grup berhasil didaftarkan :D```")
                                        await saveGrup(pesan.from, grup[pesan.from])
                                    } else {
                                        pesan.reply("```Grup sudah terdaftar ngab```");
                                    }
                                } else {
                                    pesan.reply('```kamu bukan admin ataupun Alfan```')
                                }
                            }
                            break;
                        case "fitur":
                            grup = await initGrup();
                            if (pesan_split[1] != undefined && pesan_split[2] != undefined && fitur_grup.includes(pesan_split[1]))
                                if (pesan.isGroup) {
                                    if (grup[pesan.from] != undefined) {
                                        if (pesan.isAdmin()) {
                                            if (statY.concat(statN).includes(pesan_split[2])) {
                                                var opsi = statY.includes(pesan_split[2])
                                                grup[pesan.from]["fitur"][`notif-${pesan_split[1]}`] = opsi
                                                let ext = (opsi) ? "aktif" : "tidak aktif";
                                                pesan.reply(`fitur notifikasi ${pesan_split[1]} sudah ` + ext)
                                                    // fs.writeFileSync(`./lib/grup.json`, JSON.stringify(grup, null, 2));
                                                await saveGrup(pesan.from, grup[pesan.from])
                                            } else {
                                                pesan.reply("Pilihan tak tersedia")
                                            }
                                        } else {
                                            pesan.reply("Anda bukan admin")

                                        }
                                    } else {
                                        pesan.reply("Grup belum terdaftar")
                                    }
                                }
                            break
                        case "notif":
                            grup = await initGrup();
                            if (grup[pesan.from] && grup[pesan.from]["sapaan"] && ["welcome", "farewell"].includes(pesan_split[1])) {
                                grup[pesan.from]["sapaan"][`${pesan_split[1]}`] = pesan_split[2];
                                await fs.writeFileSync(`./lib/grup.json`, JSON.stringify(grup, null, 2));
                                pesan.reply(`*pesan ${pesan_split[1]} telah diubah*`)
                                await saveGrup(pesan.from, grup[pesan.from])
                            }
                            break;
                        case 'script':
                            eval(`async function foo(){
                            ${pesan_split[1]}
                        }

                        foo()
                        `)
                            break
                        case 'hitung':
                            pesan = await pesan.getQuotedMsg()
                            break
                        case 'download':
                            let download = {
                                title: 'Menu Download',
                                rows: []
                            }
                            let i = 1;
                            for (item in linkDownload) {
                                let ini = linkDownload[item];
                                (download.rows).push({
                                    title: ini.deskripsi,
                                    description: ini.link,
                                    rowId: 'link' + (i)
                                })
                                i++
                            }
                            alfan.sendMessage(pesan.from, {
                                buttonText: 'pilihan',
                                description: '*Menu Download*',
                                listType: 1,
                                sections: [download],

                            }, 'listMessage', { quoted: msg })
                            break;
                        case 'matkul':
                            let nama = pesan_split[2] || 'all'
                            var daftar_matkul = new MatKul(nama, matkul[nama])
                            let arg = eval(pesan_split[1])
                            let daftar = daftar_matkul.tampilkan(arg)
                            pesan.reply(daftar)
                            break
                        case 'dirmausu':
                            const dir = await fetch(`https://direktori.usu.ac.id/mahasiswa/search?nim=${pesan_split[1]}`, { method: 'get' })
                            let objDir = await dir.json()
                            let teks = "*DIRMAHASISWA USU*\n\n"
                            objDir.forEach(x => {
                                teks +=
                                    `Nama: ${x['nama']}\n` +
                                    `NIM : ${x['nim']}\n` +
                                    `Jenis Kelamin: ${x['jenis_kelamin']}\n` +
                                    `Fakultas : ${x['fakultas']}\n` +
                                    `Prodi : ${x['prodi']}\n\n`;
                            })
                            pesan.reply(teks)
                            break;
                        case 'addmatkul':
                            var tts = pesan_split[2]
                            if (pesan.hasQuotedMsg == true) {
                                pesan = new Pesan(await pesan.getQuotedMsg(), alfan);
                                tts = pesan.body
                            }

                            let mtkl = new MatKul(pesan_split[1])
                            await mtkl.textToObj(tts, true)
                            await mtkl.addMatkul(matkul, pesan)
                            console.log(mtkl)
                            break
                        case 'drakor':
                            try {
                                let drakor = new drakorID(pesan_split[1])
                                drakor = await drakor.search(pesan_split[1])
                                    // for(let data in drakor){
                                    //     hehe += index+'. '+drakor[data]['judul']+'\n';
                                    //     index++
                                    // }
                                    // console.log(drakor)
                                let menu_drakor = {
                                    title: '*HASI PENCARIAN...*',
                                    rows: []
                                }
                                let index = 1;
                                for (item in drakor) {
                                    let ini = drakor[item];
                                    (menu_drakor.rows).push({
                                        title: ini['judul'],
                                        description: '',
                                        rowId: 'drakor_' + ini['link'] + '_' + pesan_split[1].replaceAll(' ', '-')
                                    })
                                    index++
                                }
                                alfan.sendMessage(pesan.from, {
                                    buttonText: 'click this✔',
                                    description: '*HASIL PENCARIAN...*',
                                    listType: 1,
                                    sections: [menu_drakor],

                                }, 'listMessage', { quoted: msg })
                            } catch (err) {
                                pesan.reply('Sepertinya judul tidak ditemukan atau ada error')
                            }
                            break;
                        case 'ttd':
                            try {
                                if (pesan.hasQuotedMsg == true) {
                                    pesan = new Pesan(await pesan.getQuotedMsg(), alfan);
                                    tts = pesan.body
                                }
                                if (pesan.hasMedia == true) {
                                    let nama_warna = (pesan_split[1] !== undefined) ? `ttd_${pesan_split[1]}` : 'ttd';
                                    let buf_img = await pesan.toBuffer();
                                    let img = await Jimp.read(buf_img);
                                    let ttd = await Jimp.read('./src/' + nama_warna + '.png')
                                    let w = img.bitmap.width,
                                        h = img.bitmap.height;
                                    if (w < h) {
                                        h = w;
                                    } else {
                                        w = h;
                                    }
                                    var w1 = Math.floor(w * 3 / 10)
                                    ttd = await ttd.resize(w1, w1);
                                    img.composite(ttd, 0, img.bitmap.height - w).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                                        alfan.sendMessage(pesan.from, buffer, image, { thumbnail: logo.toString('base64') });
                                    })
                                } else {
                                    pesan.reply("⚠️```WARNING!!!\nMohon balas dengan Gambar atau kirim gambar lalu ketik " + prefix + "ttd```")
                                }
                            } catch (err) {
                                pesan.reply("Sepertinya terjadi kesalahan\n_-Bot ALFN_")
                                log(err)
                                return
                            }


                            break;
                        case 'yt':
                            console.log('Starting search');
                            var yts = await ytSearch.search(pesan_split[1])
                            var video = yts.videos.slice(0, 10);
                            console.log('found video');
                            let menu_yt = {
                                title: pesan_split[1],
                                rows: []
                            }
                            video.forEach(x => {
                                menu_yt.rows.push({
                                    title: left(x.title, 30),
                                    description: '',
                                    rowId: `yt>>${x.videoId}`
                                })
                            })
                            await alfan.sendMessage(pesan.from, {
                                buttonText: '✔ click this',
                                description: `*Hasil Pencarian ${pesan_split[1]}*`,
                                listType: 1,
                                sections: [menu_yt],

                            }, 'listMessage', { quoted: msg })
                            break;

                        case 'mp3':
                            yts = await ytSearch.search(pesan_split[1])
                            video = yts.videos.slice(0, 1);
                            let yt = await ytdl(video[0].videoId, { quality: 'highestaudio' })
                            await pesan.tunggu()
                                // let buffer = await Util.mp4ToMp3(yt);

                            let buffer = Buffer.from(await streamToBase64(yt), 'base64');
                            await alfan.sendMessage(pesan.from, buffer, audio, { mimetype: 'audio/mpeg', ptt: true });
                            break;

                        case 'lirik':
                            pesan.reply('\u231B _tunggu sebentar ya say..._');
                            let lirik = await solenolyrics.requestLyricsFor(pesan_split[1])
                            let title = await solenolyrics.requestTitleFor(pesan_split[1])
                            let icon = await solenolyrics.requestIconFor(pesan_split[1]) || { url: logo }
                            console.log(icon)
                            let author = await solenolyrics.requestAuthorFor(pesan_split[1])
                            if (lirik != undefined && title != undefined && icon != undefined && author != undefined) {
                                let teks_lirk = `*${title}*\nby:*${author}*\n\n_${lirik}_\n\nALFN-BOT`;
                                await alfan.sendMessage(pesan.from, { url: icon }, image, { caption: teks_lirk })
                            } else {
                                await pesan.reply('_lirik tidak ketemu :(_')
                            }

                            break;

                        case 'nr':

                            alfan.sendMessage(pesan.from, 'silahkan klik link ini:\n' +
                                host[0] +
                                'newton-raphson?fungsi=' + pesan_split[1] +
                                '&x0=' + pesan_split[2] +
                                '&N=' + pesan_split[3] +
                                '&e=' + pesan_split[4], text)


                            break
                        case 'delete':
                            newMsg = await pesan.getQuotedMsg();

                            if (newMsg != null) {
                                pesan = new Pesan(newMsg, alfan);
                                console.log(newMsg)
                                id = await pesan.id;
                                jid = await pesan.author;
                                await alfan.deleteMessage(jid, { id: id, remoteJid: pesan.from, fromMe: true });
                                await pesan.reply('🚮 _Pesan telah dihapus_')
                            }
                            break;
                        case 'cek':
                            let gc = await pesan.grupData()
                            let kontakku = []
                            let kalimat = '*GAK AKTIF DI KONTAK BOT*:\n_Note: yang ditag dan dia merasa masih aktif silahkan balas "HAI" ya_\n\n'
                            let k = 0;
                            gc.participants.forEach((x) => {
                                if (x.notify == undefined && x.vname == undefined) {
                                    let nomor = toID(x.id)
                                    kalimat += (k + 1) + '.   @' + nomor + '\n'
                                    kontakku.push(x.jid)
                                    k++;
                                }
                            })
                            alfan.sendMessage(pesan.from, kalimat, text, { contextInfo: { mentionedJid: kontakku } })
                            break;
                        case 'canvas':
                            let nam = await pesan_split[1] || 'Alien';
                            nomor = await pesan.author || 'xxx';
                            await logo
                            let foto;
                            try {
                                let link = await alfan.getProfilePicture(pesan.author)
                                foto = link;
                            } catch (error) {
                                foto = logo;
                                console.log('yahhh')
                            }
                            await foto;
                            gambar = await toCanvas(nomor, 'ALFN-BOT', foto, nam)
                            await gambar
                            await alfan.sendMessage(pesan.from, gambar, image, { caption: '_Done_ ✔️', contextInfo: { mentionedJid: [pesan.author] } })
                            break;
                        case 'menu-text':
                            let menu_list = {
                                title: 'Pilihan',
                                rows: [{
                                        title: `${prefix}sketch >> Alfan Irsyadi`,
                                        rowId: 'text1',
                                    },
                                    {
                                        title: `${prefix}game_over >> Alfan Irsyadi >> redRhommbus`,
                                        rowId: 'text2',
                                    },
                                    {
                                        title: `${prefix}pornhub >> Alfan >> Irsyadi`,
                                        rowId: 'text3',
                                    },
                                    {
                                        title: `${prefix}blackpink >> Alfan Irsyadi`,
                                        rowId: 'text4',
                                    },
                                    {
                                        title: `${prefix}glitch_tt >> Alfan Irsyadi >> redRhombus`,
                                        rowId: 'text5',
                                    },
                                    {
                                        title: `${prefix}glitch >> Alfan Irsyadi >> redRhombus`,
                                        rowId: 'text6',
                                    },
                                    {
                                        title: `${prefix}glitch_imp >> Alfan Irsyadi`,
                                        rowId: 'text7',
                                    },
                                    {
                                        title: `${prefix}capt_america >> Alfan Irsyadi >> redRhombus`,
                                        rowId: 'text8',
                                    },
                                    {
                                        title: `${prefix}multicolor3d >> Alfan Irsyadi`,
                                        rowId: 'text9',
                                    },
                                ]
                            }


                            alfan.sendMessage(pesan.from, {
                                buttonText: 'klik ini',
                                description: '_Silahkan dipilih_',
                                listType: 1,
                                sections: [menu_list],

                            }, 'listMessage', { quoted: msg })
                            break;
                        case 'sketch':
                        case 'game_over':
                        case 'pornhub':
                        case 'blackpink':
                        case 'glitch_tt':
                        case 'glitch':
                        case 'glitch_imp':
                        case 'capt_america':
                        case 'multicolor3d':
                            await pesan.tunggu();
                            let gambar1;
                            let query_1 = pesan_split[1] || "Alfan Irsyadi";
                            let query_2 = pesan_split[2] || "redRhombus";
                            let teksMaker = await axios.get(
                                'https://alfan-irsyadi-api.herokuapp.com/textpro?style=' + command + '&text1=' + query_1 + '&text2=' + query_2
                            )

                            let capt = '_Done_ @' + toID(pesan.author);
                            await teksMaker
                            gambar1 = { url: teksMaker.data.link }
                            console.log(gambar1)
                            await alfan.sendMessage(pesan.from, gambar1, image, { caption: capt, contextInfo: { mentionedJid: [pesan.author] } })
                            break;
                        case 'notif-img':
                            await cekImg(pesan.from, pesan_split[1], async(x) => {
                                console.log(x)
                                await balas(x, text)
                            })
                            break;
                        case 'hbd-nadia':
                            await logo

                            break;
                        case 'contoh':
                            var menu_ = {
                                title: 'Pilihan',
                                rows: [{
                                        title: `${prefix}daftar`,
                                        rowId: 'text0',
                                    },
                                    {
                                        title: `${prefix}ping`,
                                        rowId: 'text1',
                                    },
                                    {
                                        title: `${prefix}stiker`,
                                        rowId: 'text2',
                                    },
                                    {
                                        title: `${prefix}welcome`,
                                        rowId: 'text3',
                                    },
                                    {
                                        title: `${prefix}tagsemua`,
                                        rowId: 'text4',
                                    },
                                    {
                                        title: `${prefix}download`,
                                        rowId: 'text5',
                                    },
                                    {
                                        title: `${prefix}dirmausu >> 190803102`,
                                        rowId: 'text6',
                                    },
                                    {
                                        title: `${prefix}yt >> Kaleb J - It's Only Me`,
                                        rowId: 'text7',
                                    },
                                    {
                                        title: `${prefix}mp3 >> Kaleb J - It's Only Me`,
                                        rowId: 'text8',
                                    },
                                    {
                                        title: `${prefix}lirik >> Kaleb J It's Only Me`,
                                        rowId: 'text9',
                                    },
                                    {
                                        title: `${prefix}menu-text`,
                                        rowId: 'text10',
                                    },
                                    {
                                        title: `${prefix}daftar-grup`,
                                        rowId: 'text11',
                                    },

                                ]
                            }


                            alfan.sendMessage(pesan.from, {
                                buttonText: 'klik ini',
                                description: deskripsi + '\n_Silahkan dipilih_',
                                listType: 1,
                                sections: [menu_],

                            }, 'listMessage', { contextInfo: { mentionedJid: [owner] }, quoted: msg })
                            break;
                        case 'siapa':
                        case 'who':
                            var pertanyaan, jawaban;
                            if (!pesan_split[2]) {
                                pertanyaan = 'ℙ𝕖𝕣𝕥𝕒𝕟𝕪𝕒𝕒𝕟';
                                jawaban = '𝕁𝕒𝕨𝕒𝕓𝕒𝕟';
                            } else if (pesan_split[2] == 'lite') {
                                pertanyaan = '*Pertanyaan*';
                                jawaban = '*Jawaban*';
                            }
                            let grup1 = await pesan.grupData()
                                // console.log(obrolan.participants)
                            var siapa = grup1.participants[Math.floor(Math.random() * (grup1.participants).length)]
                            siapa = siapa.jid;
                            if (pesan_split[1].includes('ganteng')) siapa = '6281276790748@s.whatsapp.net';
                            await siapa
                            // console.log(siapa)
                            var template = pertanyaan + ':\n--> ' + pesan_split[1] + '\n' + jawaban + ':\n--> @' + toID(siapa);
                            // console.log(template)
                            pesan.adReply(template, pesan.from, siapa);
                            break;
                        case 'tendang':
                        case 'keluarkan':
                        case 'keluar':
                        case 'kick':
                            if (await pesan.isAdmin() && await pesan.isGroup) {
                                let mentioned = await pesan.getMentioned();
                                console.log(mentioned)

                                if (mentioned != null) {
                                    if (mentioned.includes('6281276790748@s.whatsapp.net')) {
                                        pesan.adReply('_Anda tidak dapat meng-kick owner bot_')
                                    } else {
                                        await alfan.groupRemove(pesan.from, mentioned);
                                    }
                                }

                            }
                            break;
                        case 'tambah':
                        case 'undang':
                        case 'invite':
                        case 'add':
                            if (await pesan.isAdmin() && await pesan.isGroup) {
                                nomor = [];
                                pesan_split[1].split(',').forEach(async(x) => {
                                    nomor.push(phoneNumberFormatter(x));
                                });
                                await nomor;
                                console.log(nomor)
                                await alfan.groupAdd(pesan.from, nomor);

                            }

                            break;
                        case 'simih':
                        case 'bot':
                        case 'simi':
                            let param;
                            param = pesan_split[1]
                            if (param == undefined) param = 'halo';
                            let data = await axios('https://simsumi.herokuapp.com/api?text=' + param + '%20simi&lang=id');

                            await data;
                            // data = JSON.parse(JSON.stringify(data))
                            console.log(data.data.success);
                            let success = (data.data.success)
                            if (success.includes('simi')) {

                                success = success.replaceAll('simi', 'bot');
                            }
                            await success
                            await balas(success, text)
                            break;
                        case 'mp4':
                            yts = await ytSearch.search(pesan_split[1])
                            video = yts.videos.slice(0, 1);
                            console.log(await Util.yt(video[0].videoId))
                            break
                        case 'tebak':
                            if (await pesan.isGroup && tebak.grup[pesan.from].state == 0)
                                switch (pesan_split[1]) {
                                    case undefined:
                                    case 'login':
                                        await tebak.addPlayer(await pesan.author, async(resp) => {
                                            pesan.reply(resp)
                                        })

                                    case 'show':

                                    case 'tampilkan':
                                    case 'tampil':
                                        await logo
                                        let foto;
                                        try {
                                            let link = await alfan.getProfilePicture(pesan.from)
                                            const response = await axios.get(link, { responseType: 'arraybuffer' })
                                            foto = Buffer.from(response.data, "utf-8")
                                        } catch (error) {
                                            foto = logo;
                                        }
                                        await foto
                                        let tampil = await tebak.show()
                                        let judul = await pesan.grupData();
                                        judul = await judul.subject
                                        log(await pesan.grupData())
                                        const message = {
                                            text: tampil,
                                            contextInfo: {
                                                externalAdReply: {
                                                    title: judul,
                                                    body: 'TEBAK KATA by @alfanirsyadi_',
                                                    thumbnail: foto,
                                                    link: 'RedRhombus',
                                                    mediaType: 1,
                                                },
                                                mentionedJid: OTebak[pesan.from].player
                                            }
                                        }
                                        log(message.contextInfo)
                                        setTimeout(async() => {
                                            await alfan.sendMessage(pesan.from, message, text, { quoted: msg })
                                        }, 2000)
                                        break;
                                    case 'mulai':
                                        log(tebak.grup[pesan.from])
                                        if (tebak.grup[pesan.from].state == 0) {
                                            if (await tebak.grup[pesan.from].player.includes(pesan.author)) {
                                                tebak.grup[pesan.from].state = 1;
                                                await tebak.mulai()
                                                await tebak.mulai()
                                                await tebak.mulai()
                                                await tebak.mulai()
                                                await tebak.mulai()
                                                tebak.grup[pesan.from].state = 0;

                                                await tebak.rank()

                                                await tebak.clearPlayer()
                                                await tebak.clearPoint()

                                                await pesan.custom('_Permainan berakhir_')

                                            } else if (tebak.grup[pesan.from].state == 0) {
                                                await pesan.custom('_Kamu belum login. Silahkan login dengan ketik #tebak_')
                                            }
                                        } else {
                                            pesan.reply('_sedang bermain_')
                                        }

                                        break;
                                }
                            else {
                                pesan.adReply('_sedang bermain_')
                            }

                            break;
                        case 'math':
                            if (await pesan.isGroup && mtk.grup[pesan.from].state == 0)
                                switch (pesan_split[1]) {
                                    case undefined:
                                    case 'login':
                                        await mtk.addPlayer(await pesan.author, async(resp) => {
                                            pesan.reply(resp)
                                        })

                                    case 'show':

                                    case 'tampilkan':
                                    case 'tampil':
                                        await logo
                                        let foto;
                                        try {
                                            let link = await alfan.getProfilePicture(pesan.from)
                                            const response = await axios.get(link, { responseType: 'arraybuffer' })
                                            foto = Buffer.from(response.data, "utf-8")
                                        } catch (error) {
                                            foto = logo;
                                        }
                                        await foto
                                        let tampil = await mtk.show()
                                        let judul = await pesan.grupData();
                                        judul = await judul.subject
                                        log(await pesan.grupData())
                                        const message = {
                                            text: tampil,
                                            contextInfo: {
                                                externalAdReply: {
                                                    title: judul,
                                                    body: 'MATH QUIZ by @alfanirsyadi_',
                                                    thumbnail: foto,
                                                    link: 'RedRhombus',
                                                    mediaType: 1,
                                                },
                                                mentionedJid: mathId[pesan.from].player
                                            }
                                        }
                                        log(message.contextInfo)
                                        setTimeout(async() => {
                                            await alfan.sendMessage(pesan.from, message, text, { quoted: msg })
                                        }, 2000)
                                        break;
                                    case 'mulai':
                                        log(mtk.grup[pesan.from])
                                        if (mtk.grup[pesan.from].state == 0) {
                                            if (await mtk.grup[pesan.from].player.includes(pesan.author)) {
                                                mtk.grup[pesan.from].state = 1;
                                                await mtk.mulai()
                                                await mtk.mulai()
                                                await mtk.mulai()
                                                mtk.grup[pesan.from].state = 0;
                                                await mtk.clearPlayer()
                                                await pesan.custom('_Permainan berakhir_')
                                            } else {
                                                await pesan.custom('_Kamu belum login. Silahkan login dengan ketik #math_')
                                            }
                                        } else {
                                            pesan.reply('_sedang bermain_')
                                        }

                                        break;
                                }
                            else {
                                pesan.adReply('_sedang bermain_')
                            }

                            break;

                        case 'game':
                            log(player)
                            let operasi = ['+', '-']

                            a = Math.floor(Math.random() * 1000);
                            b = math.floor(Math.random() * 1000);
                            let ekspresi = a + operasi[Math.floor(Math.random() * 2)] + b
                            let jawabanMath = math.evaluate(ekspresi.toString())
                                // jawaban_math.push(jawabanMath)


                            break
                        case 'timeline':

                            break;
                        case 'run':
                            await pesan.hasQuotedMsg
                            log(pesan.hasQuotedMsg)
                            if (pesan.hasQuotedMsg == true) {
                                let script = await pesan.getQuotedMsg()
                                script = new Pesan(script, alfan)
                                await script
                                script = script.body
                                let ag = pesan.body.split('>>');
                                let arg = {
                                    script: script,
                                    lang: ag[1].trim(),
                                    input: ag.slice(2).join().trim()
                                }
                                log(arg)
                                run(arg, (teks) => {
                                    pesan.adReply(teks)
                                })
                            }
                            break;
                        case 'scan':
                            await pesan.hasQuotedMsg
                            let media = msg;
                            if (pesan.hasQuotedMsg == true) {
                                media = await pesan.getQuotedMsg();
                            }
                            await media
                            let gambar = await alfan.downloadMediaMessage(media)
                            scan({
                                lang: (pesan_split[1] || 'eng'),
                                img: gambar
                            }, async(result) => {
                                let photo = await pesan.getPhoto()
                                await photo
                                pesan.custom(result, {
                                    title: 'Hasil Scan OCR',
                                    body: 'ALFN-BOT-V2',
                                    thumbnail: photo
                                })
                            })
                            break;
                        case 'remove-bg':
                            if (pesan.hasQuotedMsg == true) {
                                pesan = new Pesan(await pesan.getQuotedMsg(), alfan);
                            }
                            if (pesan.hasMedia == true) {
                                let base64img = await pesan.toBase64()
                                remove_bg(base64img, (buffer) => {
                                    alfan.sendMessage(pesan.from, buffer, document, { mimetype: "image/png", filename: "removed-bg.png" })
                                }, bg_color = pesan_split[1])
                            }
                            break;
                        case 'ip':
                            let nilai = pesan_split[1].trim().split('\n');
                            let indeks, jumlah = 0,
                                skor_indeks, sks, total_sks = 0,
                                _sks;
                            nilai.forEach(x => {
                                indeks = x.split(':');
                                switch (indeks[0].trim()) {
                                    case 'A':
                                        skor_indeks = 4;
                                        break;
                                    case 'B+':
                                        skor_indeks = 3.5;
                                        break;
                                    case 'B':
                                        skor_indeks = 3;
                                        break;
                                    case 'C+':
                                        skor_indeks = 2.5;
                                        break;
                                    case 'C':
                                        skor_indeks = 2;
                                        break;
                                    case 'D':
                                        skor_indeks = 1;
                                        break;
                                    case 'E':
                                        skor_indeks = 0;
                                        break;
                                    default:
                                        skor_indeks = 0;
                                        break;
                                }
                                sks = indeks[1].split(',');
                                _sks = 0;
                                log(sks);
                                sks.forEach(y => {
                                    log(eval(y))
                                    _sks += eval(y);

                                })
                                total_sks += _sks;
                                jumlah = jumlah + skor_indeks * _sks;

                            })
                            pesan.custom('Nilai IP anda *' + jumlah / total_sks + '*');
                            break
                        case 'wolfram':
                            var resultWA, tipe, bufferWA, hasilWA;
                            if (pesan_split[2] == 'short') {
                                resultWA = await waApi.getShort(pesan_split[1], (err) => {
                                    if (err) {
                                        pesan.reply('error')
                                        throw err;
                                    }
                                })
                                tipe = text;

                            } else {
                                resultWA = await waApi.getSimple(pesan_split[1], (err) => {
                                    if (err) {
                                        pesan.reply('error')
                                        throw err;
                                    }
                                })
                                tipe = image;
                                hasilWA = resultWA.split(',')[1]
                                bufferWA = Buffer.from(hasilWA, 'base64')
                                resultWA = bufferWA
                            }
                            // const hemmm = await waApi.getFull(pesan_split[1])
                            // for (let i in hemmm.pods){
                            //     log(hemmm.pods[i].subpods[0].img)
                            // }

                            await alfan.sendMessage(pesan.from, resultWA, tipe, { contextInfo: { mentionedJid: [pesan.author] } })
                            break
                    }
                }

            }


            // socket.emit('message', JSON.stringify(pesan, null, 2));
            // socket.emit('message', JSON.stringify(msg, null, 1));
            // log(pesan)
            // log( msg.message.listResponseMessage && msg.message.listResponseMessage.singleSelectReply)
            if (msg.message.listResponseMessage) {
                let list = (msg.message.listResponseMessage)
                console.log(list)
                let keyword = msg.message.listResponseMessage.singleSelectReply.selectedRowId.split('>>')
                if (keyword[0] == 'drakor') {
                    let drakorC = new drakorID(keyword[2])
                    let eps = await drakorC.episode(keyword[1])
                        // let jdl = list['title'];

                    // pesan.reply(jdl)
                    let menu_drakor = {
                        title: list['title'],
                        rows: []
                    }
                    let index = 1;
                    eps.forEach((x, i) => {
                        log(x)
                            // jdl += `\n\n${x.episode}\n ${x.link.replace('173.233.87.137', 'drakor.id')}`
                            // (menu_drakor.rows).push({
                            //     title: x.episode,
                            //     description: x.link.replace('173.233.87.137', 'drakor.id'),
                            //     rowId : 'epsDra_'+x.link+'_'+ i
                            // })
                        index++
                    })
                    alfan.sendMessage(pesan.from, {
                        buttonText: 'click this',
                        description: 'Link Streaming ' + list['title'],
                        listType: 1,
                        sections: [menu_drakor],

                    }, 'listMessage', { quoted: msg })
                } else if (keyword[0] == 'yt') {
                    await pesan.tunggu();
                    let content = await ytSearch({ videoId: keyword[1] });
                    var judul = `_${content.title}_`;
                    let time = content.timestamp.split(':');
                    let durasi = `_${content.timestamp}_`;
                    let viewer = `_${nFormatter(content.views)}_`;
                    let thumbnail = logo;
                    await thumbnail
                    const media = await alfan.prepareMessage(pesan.from, thumbnail, image) // change for file type

                    const buttons = [
                        { buttonId: 'ytdl>>1>>' + keyword[1], buttonText: { displayText: '🎬 mp4' }, type: 1 },
                        { buttonId: 'ytdl>>2>>' + keyword[1], buttonText: { displayText: '🎵 mp3' }, type: 1 },
                    ]
                    var teksBut = `*Judul*:\n${judul}\n*Durasi*:\n${durasi}\n*Viewers*:\n${viewer}`;
                    const buttonMessage = {
                        contentText: teksBut,
                        footerText: "_Mau download mp4 atau mp3 beb?_",
                        buttons: buttons,
                        headerType: 4, // change for file type
                        imageMessage: media.message.imageMessage // change for file type
                    }
                    await alfan.sendMessage(pesan.from, buttonMessage, buttonsMessage)


                }
            }
            let button = msg.message.buttonsResponseMessage;
            if (button != undefined) {
                let comm = button.selectedButtonId.split('>>');
                log(comm)
                switch (comm[0]) {
                    case 'ytdl':
                        await pesan.tunggu();
                        let arg = button.selectedButtonId.replace(comm[0] + '>>' + comm[1] + '>>', '');
                        log(arg)
                        let yt = await ytdl(arg, { quality: 'highest' });
                        let buff = Buffer.from(await streamToBase64(yt), 'base64');

                        if (comm[1] == '1')
                            alfan.sendMessage(pesan.from, buff, document, { mimetype: 'video/mp4', filename: arg });
                        else if (comm[1] == '2')
                            alfan.sendMessage(pesan.from, buff, audio, { mimetype: 'audio/mpeg', ptt: true })
                        break;
                }
            }

        } catch (err) {
            alfan.sendMessage(pesan.from, "❎ ```Error:```\n" + err.toString(), text);
            log(err)
        }


    })



    alfan.on('CB:Presence', async(json) => {
        if (alfan.contacts[json[1].id.split('@')[0] + "@s.whatsapp.net"] && alfan.contacts[json[1].id.split('@')[0] + "@s.whatsapp.net"].notify != undefined)
            console.log("[PRESENCE] <" + new Date().toUTCString() + "> " + alfan.contacts[json[1].id.split('@')[0] + "@s.whatsapp.net"].notify + " presence is " + json[1].type)
            // console.log('---> ' +json[1] + " presence is " + json[1].type)
    })
}

// mulai()

io.on('connection', (socket) => {
    host.push(socket.handshake.headers.referer)
    mulai(socket)
})

server.listen(port, function() {
    console.log('server berjalan pada PORT: ' + port)
})