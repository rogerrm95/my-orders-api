import dotenv from 'dotenv'
import express from "express"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { q, Faunadb } from '../services/faunadb.js'

dotenv.config()

const Authenticate = express.Router()

// LOGIN //
Authenticate.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    try {
        const data = await Faunadb.query(
            q.Get(
                q.Match(
                    q.Index('user_by_email'), email
                )
            )
        )
            .then(response => response.data)
            .catch(() => res.status(404).json({ message: 'Usuário não encontrado' })
        )

        if (!data) res.status(404).json({ message: 'Usuário não encontrado' })
        if (!data.isActive) res.status(401).json({message: 'Usuário inativado pelo administrador'})
        
        const isMatch = bcrypt.compareSync(password, data.password)

        if (!isMatch) {
            res.status(404).json({ message: 'Senha inválida' })
        }

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            job: data.job,
            iat: now,
            exp: now + (60 * 60 * 2 ) // 2 hora //
        }

        return res.status(200).json({
            ...payload,
            token: jwt.sign(payload, process.env.AUTH_SECRET_KEY)
        })
    } catch {
        return res.status(500).json({ message: 'Erro durante o processamento' })
    }
})

export default Authenticate;