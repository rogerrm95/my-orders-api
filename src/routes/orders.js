import express from 'express'
import validate from '../middleware/validateToken.js'
import { q, Faunadb } from '../services/faunadb.js'

const Orders = express.Router()

Orders.get('/orders', validate, async (req, res, next) => {

    try {
        const response = await Faunadb.query(
            q.Map(
                q.Paginate(
                    q.Match(
                        q.Index('all_orders')
                    )
                ),
                q.Lambda('ordersRef',
                    q.Get(
                        q.Var('ordersRef')
                    )
                )
            )
        )
            .then(res => {
                return res.data.map((item) => item.data)
            })
            .catch(_ => {
                return res.status(404).json({ message: 'Dados não encontrados' })
            })

        return res.status(200).json(response)

    } catch (error) {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Orders.post('/orders', validate, async (req, res, next) => {
    const data = req.body

    try {
        const response = await Faunadb.query(
            q.Create(
                q.Collection('orders'),
                { data }
            )
        )

        return res.status(200).json(response)
    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})



export default Orders;