const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    mode: {
      type: String,
      enum: ['normal', 'sticky'],
      default: 'normal',
      required: true
    },
    content: {
      type: String,
      default: ''
    },
    isSticky: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index so key 'xyz' in 'normal' mode and 'xyz' in 'sticky' mode are independent
documentSchema.index({ key: 1, mode: 1 }, { unique: true });

module.exports = mongoose.model('Document', documentSchema);
