const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  razorpay_order_id: {
    type: String

  },
  orderid: {
    type: String
  },
  razorpay_payment_id: {
    type: String

  },
  product: {
    type: Object,
    required: true,
  },
  paymenttype:{
    type:String

  },
  totalprice: {
    type: Number,
    required: true

  },
  cashamount: {
    type: Number
  },
  returnamount: {
    type: Number
  },

  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Sells", PaymentSchema)