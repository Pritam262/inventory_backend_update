const express = require("express")

const router = express.Router();

// import fetchuser from "../middleware/fetchuser";
const fetchuser = require("../middleware/fetchuser")
// import Product from "../model/Product";
const Product = require("../model/Product")


// Route 1: Get all the product using /api/product/fetchallproducts
router.get("/fetchallproduct", fetchuser, async (req, res) => {
    try {
        const allProducts = await Product.find({ user: req.user.id })

        const products = allProducts.map((item)=> ({
            id:item._id,
            title:item.title,
            productId:item.id,
            qty:item.qty,
            unit:item.unit,
            price:item.price,
            totalPrice:(item.qty*item.price),
            date:item.date
        }))
        res.status(200).send(products)
    } catch (error) {
       
        res.status(500).send("Internal server error")

    }
})



// Route 2: add  product using /api/product/addproduct
router.post("/addproduct", fetchuser, async (req, res) => {
    try {

        const { title, id, qty, unit, price } = req.body[0];
        const product = new Product({
            title, id, qty, unit, price, user: req.user.id
        })
        // console.log(title, id, qty, unit, price, {user: req.user.id})
        const saveProduct = await product.save()
        
        res.json(saveProduct)

    } catch (error) {
        res.status(500).send({error:error})
    }

})


// Route 3: Update a product using /api/product/updateproduct/id


router.put("/updateproduct/:id", fetchuser, async (req, res) => {
    try {

        // Create a new product object
        const newProduct = {};
        if (title) { newProduct.title = title }
        if (id) { newProduct.id = id }
        if (qty) { newProduct.qty = qty }
        if (unit) { newProduct.unit = unit }
        if (price) { newProduct.price = price }

        let produ = await Product.findById(req.params.id)

        if (!produ) return res.status(404).send("Not found")

        if (produ.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        produ = await Product.findByIdAndUpdate(req.params.id,

            { $set: newProduct }, { new: true })
        req.json({ produ })
    }
    catch (error) {
        res.status(500).send("Internal server error")
    }
})


// Route 4: Delete a product using /api/product/deleteproduct/id

router.delete('/deleteproduct/:id', fetchuser, async (req, res) => {
    try {

        // Find the note to be delete and delete it
        let produ = await Product.findById(req.params.id);
        if (!produ) { return res.status(404).send("Not Found") }
        // Allow deletion only if user owns this Note
        if (produ.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        produ = await Product.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", product: produ });

    }
    catch (error) {
        res.status(500).send("Internal server error")
    }
})




module.exports = router