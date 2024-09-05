// app.js
import express from 'express';
import { PORT } from './constants.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
