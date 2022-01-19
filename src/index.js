import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import routes from './routes.js'

const app = express()
const PORT = 8080

app.use(bodyParser.json())
app.use(cors())

app.use(express.json({ extended: false }))

app.use(routes)

app.listen(PORT, () => console.log(`Running`))