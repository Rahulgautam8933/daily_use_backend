import mongoose, { Schema } from 'mongoose';

const dataSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});





const customerSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    mobile: {
      type: String, 
      required: true,
      unique: true,
      index: true
    },
    address: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    data: {
      type: [dataSchema],
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Customer = mongoose.model('Customer', customerSchema);
