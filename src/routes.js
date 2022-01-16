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
            .catch(() => res.status(404).send('Usuário não encontrado'))


        const isMatch = bcrypt.compareSync(password, data.password)

        if (!isMatch) {
            res.status(401).send('Senha inválida')
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
        res.status(500).send('Error')
    }
})

router.post('/validateToken', (req, res) => {
    const { authorization } = req.headers

    console.log(authorization)
    /// Continuar daqui //
    // Implementar a autorização //
    // Validar se o token é válido ou não //

    res.send(true)
})

export default router;

        // ENCRIPTA A SENHA DO USUARIO //
        // const encryptPassword = (pass) => {
        //     const salt = bcrypt.genSaltSync(10)
        //     return bcrypt.hashSync(pass, salt)
        // }

        // const securePassword = encryptPassword(password)