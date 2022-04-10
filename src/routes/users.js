import bcrypt from 'bcrypt'
import express from 'express'
import validate from '../middleware/validateToken.js'
import { q, Faunadb } from '../services/faunadb.js'

const Users = express.Router()

const encryptPassword = (pass) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(pass, salt)
}

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

        if (!usersDB) return []

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
                isActive: user.data.isActive,
            }
        })

        return res.status(200).json(users)

    } catch {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Users.get('/users/:ref', validate, async (req, res, next) => {
    try {
        const { ref } = req.params

        const userFromDB = await Faunadb.query(
            q.Get(
                q.Ref(
                    q.Collection("users"), ref
                )
            )

        ).then(res => res.data)
            .catch(_ => {
                res.status(404).json({ message: 'Usuário não encontrado' })
            })

        res.status(200).json(userFromDB)
    } catch (error) {
        res.status(500).json({ message: 'Erro interno, tente novamente' })
    }
})

Users.post('/users', validate, async (req, res, next) => {
    const data = req.body
    console.log(data)

    try {
        const response = await Faunadb.query(
            q.Create(
                q.Collection('users'),
                { data }
            )
        )

        return res.status(200).json(response)

    } catch {
        res.status(500).json({ messagem: 'Erro interno, tente novamente' })
    }
})

Users.put('/users/:ref', validate, async (req, res, next) => {
    const data = req.body
    const { ref } = req.params

    if (data.password) {
        // Encripta a senha //
        data.password = encryptPassword(data.password)
    } else {
        delete data.password
    }

    try {
        await Faunadb.query(
            q.Update(
                q.Select('ref',
                    q.Get(
                        q.Ref(
                            q.Collection("users"), ref
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

Users.delete('/users/:id', validate, async (req, res, next) => {
    const { id } = req.params

    try {
        const response = await Faunadb.query(
            q.Delete(
                q.Ref(q.Collection('users'), id)
            )
        ).then(res => {
            return res.data
        }).catch(_ => res.status(404).json({ message: 'Usuário não encontrado' }))

        return res.status(201).json(response)

    } catch {
        res.status(500).json({ messagem: 'Erro interno, tente novamente' })
    }
})

export default Users;