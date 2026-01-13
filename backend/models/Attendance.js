import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  present: {
    type: Boolean,
    default: false
  },
  readAssignment: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index to ensure one attendance record per member per date
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
