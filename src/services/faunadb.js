import fauna from 'faunadb'
import dotenv from 'dotenv'

dotenv.config()

const q = fauna.query

const Faunadb = new fauna.Client({
    secret: process.env.FAUNA_KEY,
    domain: 'db.us.fauna.com',
    scheme: 'https',
    port: 443
})

export { Faunadb, q }