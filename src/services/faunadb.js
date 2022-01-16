import fauna from 'faunadb'
import dotenv from 'dotenv'

dotenv.config()

const q = fauna.query

const faunadb = new fauna.Client({
    secret: process.env.FAUNA_KEY,
    domain: 'db.fauna.com'
})

export { faunadb, q }