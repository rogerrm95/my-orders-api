import express from 'express'

// Rotas //
import Authenticate from './auth.js'
import Home from './home.js'
import Orders from './orders.js'
import Foods from './foods.js'
import Users from './users.js'

const Routes = express.Router()

Routes.use(Authenticate)
Routes.use(Home)
Routes.use(Orders)
Routes.use(Foods)
Routes.use(Users)

export default Routes;