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

        const foods = foodsDB.data.map(food => food.data)     

        return res.status(200).json(foods)
    } catch {
        return res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Foods.post('/foods', async (req, res, next) => {
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

Foods.patch('/foods', async (req, res, next) => {
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


export default Foods;