const mongoose = require("mongoose");
// schema
const CardSchema = new mongoose.Schema({
  card_type: {
    type: String,
    trim: true,
  },
  card_number: {
    type: String,
    trim: true,
  },
  month: {
    type: String,
    trim: true,
  },
  year: {
    type: String,
    trim: true,
  },
  card_cvv: {
    type: String,
    trim: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
new Date().getUTCMonth;
const card = mongoose.model("cards", CardSchema);
module.exports = card;
