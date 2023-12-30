const express = require("express")

const router = express.Router();
const crypto = require("crypto")

const instance = require("../instance")
const fetchuser = require('../middleware/fetchuser')
const Sells = require("../model/Sells")



// Api 1: Endpoint to create a payment order

router.post('/create-order',async (req,res)=>{
    try {
        // const {amount,currency,receipt} = req.body

        // console.log("Create orderId request", req.body)
        // console.log("Amount",req.body.amount)

        const options = {
          amount: Number(req.body.amount),
          currency: "INR",
        };
        const order = await instance.orders.create(options);
        
        console.log("Order",order)
      
        res.status(200).json({
          success: true,
          order,
        });
   

    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

// Generate signature

function generateSignature(orderId, paymentId) {
    const text = `${orderId}|${paymentId}`;
  
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET);
    hmac.update(text);
  
    const signature = hmac.digest('hex');
    return signature;
  }


//Api 2: Endpoint to varify the payment

router.post('/varify-payment',fetchuser, async(req,res)=>{
    try {



      const { razorpay_order_id, razorpay_payment_id, razorpay_signature ,productItem} =
      req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
      .update(body.toString())
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
  
    if (isAuthentic) {
      // Database comes here
  
      const product = new Sells({
        productItem,razorpay_order_id,razorpay_payment_id, user: req.user.id
    })
    // console.log(title, id, qty, unit, price, {user: req.user.id})
    const saveProduct = await product.save()
  
      res.redirect(
        `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
      );
    }

       
          else{
            res.status(400).json({error:"Invalid signature"})
          }

    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

module.exports = router