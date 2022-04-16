import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// Rota //
import Routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(express.json({ extended: false }));

app.use(Routes);

app.listen(3333, () => console.log(`Running`));