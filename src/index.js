
import mongoose from 'mongoose';
import app from './app.js';
import { PORT } from './constants.js';


const MONGO_URI = 'mongodb+srv://rahulsoftfix:T7dt7oCSKRPMIrtT@cluster0.5gp9u.mongodb.net/';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
