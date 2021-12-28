const mongoose = require("mongoose");
// schema
const NotifSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  user_id: {
    type: String,
  },
  status: {
    type: String,
    default: "unread",
    enum: ["read", "unread"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("notifications", NotifSchema);
module.exports = Notification;
