import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import routes from './routes.js'

const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(routes)

app.listen(8080, () => console.log('Running'))