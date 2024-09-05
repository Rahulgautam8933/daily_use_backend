import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    data: [dataSchema] // Array of sub-documents
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const User = mongoose.model('User', userSchema);

export default User;
