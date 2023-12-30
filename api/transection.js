const express = require("express")

const router = express.Router();

// import fetchuser from "../middleware/fetchuser";
const fetchuser = require("../middleware/fetchuser")
// import Product from "../model/Product";
const Sells = require("../model/Sells")

// Get all transections
router.get('/alltransection', fetchuser, async (req, res) => {
    try {

        const transectionsData = await Sells.find({ user: req.user.id });
        const data = transectionsData.map((item) => { return ({ id: item._id, orderId: item.orderid, paymentType: item.paymenttype, totalPrice: item.totalprice, returnAmount: item.returnamount, date: item.date }) });

        res.status(200).send({ transections: data });
    } catch (error) {
        res.status(500).send({ error })
    }
})

// Get perticular transection

router.get('/gettransection', fetchuser, async (req, res) => {
    try {
        const id = req.query.id;
        if (id) {
             const transectionsData = await Sells.find({ user: req.user.id, _id: id});
             if(!transectionsData){
                res.status(200).send('ID isnt available');
             }
         res.status(200).send({ data: transectionsData });
        
        }
        else {
             res.status(200).send('Id not fount'); }


    } catch (error) {
        res.status(500).send({ error })
    }
})





module.exports = router;