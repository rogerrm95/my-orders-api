import express from 'express'

// Rotas //
import Authenticate from './auth.js'
import Home from './home.js'
import Orders from './orders.js'

const Routes = express.Router()

Routes.use(Home)
Routes.use(Authenticate)
Routes.use(Orders)

export default Routes;