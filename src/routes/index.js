import express from 'express'

// Rotas //
import Authenticate from './auth.js'
import Home from './home.js'

const Routes = express.Router()

Routes.use(Home)
Routes.use(Authenticate)

export default Routes