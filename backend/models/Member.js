import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  category: {
    type: String,
    enum: ['regular', 'temple-prep', 'mission-prep'],
    default: 'regular'
  },
  email: String,
  phone: String
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
