const { Boom } = require('@hapi/boom')
const {
    default: makeWASocket,
    makeInMemoryStore,
    downloadMediaMessage,
    proto,
    generateWAMessageFromContent,
    AnyMessageContent,
    delay,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useSingleFileAuthState,
    loadMessage,
    downloadContentFromMessage
} = require('@adiwajshing/baileys')
const P = require('pino')
const startSock = async(phone) => {
    const { state, saveState } = useSingleFileAuthState(`./auth_info_multi_${phone}.json`)

    // the store maintains the data of the WA connection in memory
    // can be written out to a file & read from it
    const store = makeInMemoryStore({ logger: P().child({ level: 'debug', stream: 'store' }) })
    store.readFromFile(`./baileys_store_multi_${phone}.json`)
        // save every 10s
    setInterval(() => {
        store.writeToFile(`./baileys_store_multi_${phone}.json`)
    }, 10000)


    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state
    })

    store.bind(sock.ev)

    async(msg, jid) => {
        sock.ev.on('messages.upsert', async m => {
            console.log(`${phone} ${JSON.stringify(m, undefined, 2)}`)
            const msg = m.messages[0]
            if (!msg.key.fromMe && m.type === 'notify') {
                console.log(`${phone} replying to ${m.messages[0].key.remoteJid}`)
                    // await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
                    // await sock.sendMessage({ text: 'Hello there!' }, msg.key.remoteJid)
            }

        })

        sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    if (new Boom(lastDisconnect.error).output.statusCode !== DisconnectReason.loggedOut) {
                        startSock(phone)
                    } else {
                        console.log(`${phone} Connection closed. You are logged out.`)
                    }
                }

                console.log(`${phone} connection update ${update}`)
            })
            // listen for when the auth credentials is updated
        sock.ev.on('creds.update', saveState)

        return sock
    }
}
const multiSessions = new Map()

multiSessions.set('PhoneNo1', { sock: startSock('PhoneNo1'), res: undefined })