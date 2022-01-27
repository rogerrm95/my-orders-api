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
            .then(response => {
                return response.data.map((item) => item.data)
            })
            .catch(_ => {
                return res.status(404).json({ message: 'Dados não encontrados' })
            })

        return res.status(200).json(response)

    } catch {
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

Orders.patch('/orders/:id', validate, async (req, res, next) => {
    const id = req.params
    const data = req.body

    try {
        await Fauna.query(
            q.Update(
                q.Select("ref",
                    q.Get(
                        q.Match(
                            q.Index("order_by_id"), id
                        )
                    )
                ),
                {
                    data: { ...data }
                })
        )

        return res.status(204).json({ message: "Pedido atualizado" })
    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Orders.delete('/orders/:id', validate, async (req, res, next) => {
    const { id } = req.params

    try {
        const refOrder = await Faunadb.query(
            q.Get(
                q.Match(
                    q.Index('order_by_id'), id
                )
            )
        ).then((res) => res.ref.value.id)
            .catch(_ => res.status(404).json({ message: 'Pedido não encontrado' }))


        await Faunadb.query(
            q.Delete(
                q.Ref(q.Collection('orders'), refOrder)
            )
        )

        return res.status(201).json({ message: 'Pedido excluído' })

    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

export default Orders;