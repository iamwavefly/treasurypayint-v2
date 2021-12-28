const mongoose = require('mongoose');
// schema
const TransactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        trim: true
    },
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
    country: {
        type: String,
        trim: true
    },
    purpose: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    ownby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    }
})


const amount = mongoose.model('amount', TransactionSchema)
module.exports = amount