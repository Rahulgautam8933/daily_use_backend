// app.js
import express from 'express';
import { PORT } from './constants.js';
import userRoutes from './routes/userRoutes.js'; // Adjust path as necessary


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Use user routes
app.use('/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
