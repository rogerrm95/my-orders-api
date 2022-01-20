import dotenv from 'dotenv'
import express from "express"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { q, faunadb } from './services/faunadb.js'

dotenv.config()

const router = express.Router()

// LOGIN //
router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    try {
        const data = await faunadb.query(
            q.Get(
                q.Match(
                    q.Index('user_by_email'), email
                )
            )
        )
            .then(response => response.data)
            .catch(() => res.json({ message: 'Usuário não encontrado' })).status(404)

        if (!data) res.json({ message: 'Usuário não encontrado' }).status(404)

        const isMatch = bcrypt.compareSync(password, data.password)

        if (!isMatch) {
            res.status(404).json({ message: 'Senha inválida' })
        }

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            iat: now,
            exp: now + (60 * 60 * 24) // 1 DIA
        }

        res.json({
            ...payload,
            token: jwt.sign(payload, process.env.AUTH_SECRET_KEY)
        })
    } catch {
        res.status(500).json({ message: 'Erro durante o processamento' })
    }
})

router.post('/validateToken', (req, res) => {
    try {
        const { authorization } = req.headers

        if (!authorization) res.status(403).send("Token ausente")

        const tokenEncrypted = authorization.split([" "])[1]
        const token = jwt.decode(tokenEncrypted)

        const now = Math.floor(Date.now() / 1000)

        if (now > token.exp) {
            return res.status(403).send('Token Expirado')
        }

        res.send(true)

    } catch {
        res.send('Erro durante o processamento')
    }
})

export default router;

        // ENCRIPTA A SENHA DO USUARIO //
        // const encryptPassword = (pass) => {
        //     const salt = bcrypt.genSaltSync(10)
        //     return bcrypt.hashSync(pass, salt)
        // }

        // const securePassword = encryptPassword(password)