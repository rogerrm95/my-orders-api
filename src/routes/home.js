import express from 'express'
import validate from '../middleware/validateToken.js'

const Home = express.Router()

Home.get('/', validate, (req, res, next) => {
    return res.status(200).json({ message: "Autenticado", isAuthenticated: true })
})

export default Home;