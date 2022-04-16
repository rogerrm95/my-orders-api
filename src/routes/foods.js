import express from "express"
import { q, Faunadb } from '../services/faunadb.js'
import validate from '../middleware/validateToken.js'

const Foods = express.Router()

// Pratos //
Foods.get('/foods', validate, async (req, res, next) => {
    try {
        const foodsDB = await Faunadb.query(
            q.Map(
                q.Paginate(
                    q.Match(
                        q.Index('all_foods')
                    )
                ),
                q.Lambda('foodsRef',
                    q.Get(
                        q.Var('foodsRef')
                    )
                )
            )
        ).then(res => {
            return res.data.map(food => food.data)
        })

        if (!foodsDB) return []

        return res.status(200).json(foodsDB)
    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Foods.post('/foods', validate, async (req, res, next) => {
    const data = req.body

    try {
        const response = await Faunadb.query(
            q.Create(
                q.Collection('foods'),
                { data }
            )
        )

        return res.status(201).json(response)
    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }

})

Foods.patch('/foods', validate, async (req, res, next) => {
    const data = req.body
    const { id } = req.body

    try {
        if (!id) {
            return res.status(404).json({ message: 'Item não encontrado!' })
        }

        const response = await Faunadb.query(
            q.Update(
                q.Select("ref",
                    q.Get(
                        q.Match(
                            q.Index("food_by_id"), id
                        )
                    )
                ),
                {
                    data
                })
        )

        return res.status(201).json(response)
    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }

})

Foods.delete('/foods/:id', validate ,async (req, res, next) => {
    const { id } = req.params

    try {
        const refFood = await Faunadb.query(
            q.Get(
                q.Match(
                    q.Index('food_by_id'), id
                )
            )
        ).then((res) => res.ref.value.id)
            .catch(_ => res.status(404).json({ message: 'Item não encontrado' }))


        await Faunadb.query(
            q.Delete(
                q.Ref(q.Collection('foods'), refFood)
            )
        )

        return res.status(201).json({ message: 'Item excluído' })

    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})


export default Foods;