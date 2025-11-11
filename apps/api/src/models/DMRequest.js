// server/models/DMRequest.js
const mongoose = require('mongoose');

const DMRequestSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  recipient: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  message: {
    type: String,
    maxlength: 200,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

// Compound index for efficient queries
DMRequestSchema.index({ recipient: 1, status: 1 });
DMRequestSchema.index({ sender: 1, recipient: 1 });

// Method to check if user can send another request (24h cooldown after decline)
DMRequestSchema.statics.canSendRequest = async function (senderId, recipientId) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const recentDeclinedRequest = await this.findOne({
    sender: senderId,
    recipient: recipientId,
    status: 'declined',
    respondedAt: { $gte: oneDayAgo },
  });

  return !recentDeclinedRequest;
};

module.exports = mongoose.model('DMRequest', DMRequestSchema);
