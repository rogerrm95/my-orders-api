import express from "express"
import { q, Faunadb } from '../services/faunadb.js'

const Foods = express.Router()

// Pratos //
Foods.get('/foods', async (req, res, next) => {
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
        )

        if (!foodsDB) return []

        const foods = foodsDB.data.map(food => {
            return {
                ...food.data,
                id: food.ref.value.id
            }
        })

        return res.status(200).json(foods)
    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})


export default Foods;