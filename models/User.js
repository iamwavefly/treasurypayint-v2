const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const { v4: uuidv4 } = require("uuid");
// schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
  },
  first_name: {
    type: String,
    trim: true,
  },
  other_name: {
    type: String,
    trim: true,
  },
  fullname: {
    type: String,
  },
  email: {
    type: String,
  },
  address_line1: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  country_code: {
    type: String,
  },
  flag: {
    type: String,
  },
  number: {
    type: String,
  },
  gender: {
    type: String,
  },
  dob: {
    type: String,
  },
  marital_status: {
    type: String,
  },
  occupation: {
    type: String,
  },
  income: {
    type: String,
  },
  verify_id: {
    type: String,
  },
  token: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
  },
  password: {
    type: String,
  },
  passcode: {
    type: String,
  },
  profile: {
    type: String,
  },
  otp_token: {
    type: String,
  },
  password_token: {
    type: String,
  },
  user_id: {
    type: Number,
    default: 1234567890,
  },
  wallet_id: {
    type: String,
    trim: true,
  },
  recent_received: {
    type: String,
  },
  recent_debit: {
    type: String,
    trim: true,
  },
  available: {
    type: Number,
    default: 0.0,
  },
  pending: {
    type: Number,
    default: 0.0,
  },
  reversed: {
    type: Number,
    default: 0.0,
  },
  loan: {
    type: Number,
    default: 0.0,
  },
  tai: {
    type: Number,
  },
  tax: {
    type: Number,
    default: 0.0,
  },
  routing_number: {
    type: Number,
  },
  checkpoint: {
    type: String,
  },
  notifications: [
    {
      type: mongoose.Types.ObjectId,
      ref: "notifications",
    },
  ],
  bank: {
    type: mongoose.Types.ObjectId,
    ref: "banks",
  },
  card: {
    type: mongoose.Types.ObjectId,
    ref: "cards",
  },
  account_status: {
    type: String,
    default: "pending",
  },
  online_status: {
    type: Boolean,
  },
  sms_alert: {
    type: Boolean,
  },
  email_alert: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// UserSchema.plugin(passportLocalMongoose);

UserSchema.pre("validate", function (next) {
  const ID = Math.floor(Math.random() * 10000000000);
  const routingNum = Math.floor(100000000 + Math.random() * 900000000);
  this.user_id = ID;
  this.fullname = this.first_name + " " + this.other_name;
  this.routing_number = routingNum;
  next();
});
const user = mongoose.model("users", UserSchema);
module.exports = user;
