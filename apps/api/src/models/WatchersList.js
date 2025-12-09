// models/WatchersList.js
const mongoose = require('mongoose');

const watchersListSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: function () {
      return this.type === 'groupreply';
    },
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  userName: {
    type: String,
    required: true,
    ref: 'User',
  },
  groupChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupChat',
    required: false,
  },
  type: {
    type: String,
    enum: ['groupchat', 'groupreply'],
    required: true,
  },
});

module.exports = mongoose.model('WatchersList', watchersListSchema);
