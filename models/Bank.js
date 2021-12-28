const mongoose = require('mongoose');
// schema
const BankSchema = new mongoose.Schema({
    bank_name: {
        type: String,
        trim: true
    },
    account_name: {
        type: String,
        trim: true
    },
    account_number: {
        type: String,
        trim: true
    },
    swift_code: {
        type: String,
        trim: true
    },
    mobile_number: {
        type: String,
        trim: true
    },
    email_address: {
        type: String,
        trim: true
    },
    addby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    }
})
new Date()
.getUTCMonth
const bank = mongoose.model('bank', BankSchema)
module.exports = bank