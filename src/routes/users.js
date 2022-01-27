import express from 'express'
import validate from '../middleware/validateToken.js'
import { q, Faunadb } from '../services/faunadb.js'

const Users = express.Router()

Users.get('/users', validate, async (req, res, next) => {
    try {
        const usersDB = await Faunadb.query(
            q.Map(
                q.Paginate(
                    q.Match(
                        q.Index('all_users')
                    )
                ),
                q.Lambda('userRef',
                    q.Get(
                        q.Var('userRef')
                    )
                )
            )
        )

        const users = usersDB.data.map(user => {
            return {
                id: user.ref.value.id,
                name: user.data.name,
                lastname: user.data.lastname,
                birthday: user.data.birthday,
                phone: user.data.phone,
                email: user.data.email,
                job: user.data.job,
                genre: user.data.genre,
                amountSales: user.data.amountSales,
            }
        })

        return res.status(200).json(users)

    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

export default Users;