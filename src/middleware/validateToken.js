import jwt from 'jsonwebtoken';

async function validate(req, res, next) {
    try {
        const { authorization } = req.headers

        if (!authorization) res.status(403).json({ message: 'Token ausente' })

        const tokenEncrypted = authorization.split([" "])[1]
        const token = jwt.decode(tokenEncrypted)
        //jwt.verify

        const now = Math.floor(Date.now() / 1000)

        if (now > token.exp) res.status(403).json({ message: 'Token expirado' })

        return next()

    } catch {
        res.status(500).json({ message: 'Erro durante o processamento' })
    }
}

export { validate }