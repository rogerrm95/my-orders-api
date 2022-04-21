import jwt from 'jsonwebtoken';

function validate(req, res, next) {
    try {
        const { authorization } = req.headers

        if (!authorization) return res.status(403).json({ message: 'Token ausente' })

        const tokenEncrypted = authorization.split([" "])[1]
        const decodedToken = jwt.verify(tokenEncrypted, process.env.AUTH_SECRET_KEY, (err, decodedToken) => {
            if (err) return res.status(403).json({ message: 'Token inválido' })

            return decodedToken
        })

        const now = Math.floor(Date.now() / 1000)

        if (now > decodedToken.exp) return res.status(403).json({ message: 'Token expirado' })

        return next();
    } catch {
        res.status(500).send('Erro durante o processamento')
    }
}

export default validate;