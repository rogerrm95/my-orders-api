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
                phone: user.data.phone ? user.data.phone : '',
                email: user.data.email,
                job: user.data.job,
                genre: user.data.genre,
                amountSales: user.data.amountSales,
                isActive: user.data.isActive
            }
        })

        return res.status(200).json(users)

    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Users.post('/users', validate, async (req, res, next) => {
    const user = req.body

    try {
        await Faunadb.query(
            q.Create(
                q.Collection('users'),
                { user }
            )
        )

        return res.status(201).json({ message: 'Usuário criado' })

    } catch {
        res.status(500).json({ messagem: 'Erro interno, tente novamente' })
    }
})

Users.patch('/users', validate, async (req, res, next) => {
    const data = req.body
    const email = data.email

    try {
        await Faunadb.query(
            q.Update(
                q.Select('ref',
                    q.Get(
                        q.Match(
                            q.Index('user_by_email'), email
                        )
                    )
                ), { data }
            )
        ).then(res => {
            return res.data
        }).catch(_ => res.status(404).json({ message: 'Usuário não encontrado' }))


        return res.status(201).json({ message: "Dados atualizados" })

    } catch {
        res.status(500).json({ messagem: 'Erro interno, tente novamente' })
    }
})

export default Users;