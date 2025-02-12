import 'dotenv/config.js'
const PORT = process.env.PORT
const EMAIL = process.env.EMAIL
const PASS = process.env.PASS
const SESSIONSECRET = process.env.SESSIONSECRET

export default {
    PORT,
    EMAIL,
    PASS,
    SESSIONSECRET
}