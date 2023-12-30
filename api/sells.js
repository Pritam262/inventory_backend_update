const express = require("express")

const router = express.Router();
// import fetchuser from "../middleware/fetchuser";
const fetchuser = require("../middleware/fetchuser")

const Sells = require("../model/Sells")

// Route 1: Get all the product using /api/product/fetchallproducts
router.get("/sellsdata", fetchuser, async (req, res) => {
  try {
    const sellsData = await Sells.find({ user: req.user.id });

    // Calculate the total revenue by summing up the total prices
    const totalRevenue = sellsData.reduce((acc, item) => acc + item.totalprice, 0);

    res.status(200).json({ sellsData, totalRevenue, totalLength:sellsData.length });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


// Route 2: add product using /api/sells/addproduct
router.post('/addproduct', fetchuser, async (req, res) => {
    try {
      const { product, cashamount, totalprice, returnamount,paymenttype,orderid} = req.body;
  
    //   console.log('Received data:', req.body);
  
      const sellsProduct = new Sells({
        product,
        paymenttype,
        totalprice,
        cashamount,
        returnamount,
        orderid,
        user: req.user.id,
      });
  
    //   console.log('Saving sells product:', sellsProduct);
  
      const savedProduct = await sellsProduct.save();
  
    //   console.log('Product saved:', savedProduct);
  
      res.json(savedProduct);
    } catch (error) {
      console.error('Error saving product:', error);
      res.status(500).send({ error: error.message });
    }
  });


// Sales between two dates

  router.get('/sellsbardata', fetchuser, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id; // Get the user ID from the authenticated user
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const salesData = await Sells.find({
        date: { $gte: start, $lte: end },
        user: userId,
      }).lean();
  
      let cashAmount = 0;
      let onlineAmount = 0;
  
      salesData.forEach((item) => {
        if (item.paymenttype === 'cash') {
          cashAmount += item.totalprice;
        } else {
          onlineAmount += item.totalprice;
        }
      });
  
      const mergedSalesData = salesData.reduce((acc, item) => {
        const date = formatDate(item.date);
  
        const existingItem = acc.find((groupedItem) => groupedItem.date === date);
  
        if (existingItem) {
          item.product.forEach((product) => {
            const existingProduct = existingItem.product.find(
              (existingProd) => existingProd.title === product.title
            );
            if (existingProduct) {
              existingProduct.totalprice += product.qty * product.price;
            } else {
              existingItem.product.push({
                title: product.title,
                totalprice: product.qty * product.price,
              });
            }
            existingItem.totalprice += product.qty * product.price;
          });
        } else {
          const productData = item.product.map((product) => ({
            title: product.title,
            totalprice: product.qty * product.price,
          }));
          acc.push({
            date: date,
            product: productData,
            totalprice: item.totalprice,
          });
        }
  
        return acc;
      }, []);
  
      const totalPrice = mergedSalesData.reduce((acc, curr) => acc + curr.totalprice, 0);
  
      res.json({
        salesData: mergedSalesData,
        totalPrice: totalPrice,
        cashAmount: cashAmount,
        onlineAmount: onlineAmount,
        totalLength: mergedSalesData.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Sales product between two dates

  /*
  router.get('/salesproduct', fetchuser, async (req, res) => {
    try {
      const userId = req.user.id; // Get the user ID from the authenticated user
      const { startDate, endDate } = req.query;
  
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const salesData = await Sells.find({
        date: { $gte: start, $lte: end },
        user: userId,
      }).lean();
      const productArray = [];
      const uniqueProductArray = [];
      const productQty = 0;
      const productPrice = 0;
      const totalPrice = 0;

  const product = salesData.map((item)=>{
    const productItem = item.product.map((item)=> productArray.push(item));
    return productItem
  })
  
      res.json({ salesProduct: productArray});
    } catch (error) {
      res.status(500).json({ error:error});
    }
  });
  */
  router.get('/salesproduct', fetchuser, async (req, res) => {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;
      const start = new Date(startDate);
      const end = new Date(endDate);
  
      const salesData = await Sells.find({
        date: { $gte: start, $lte: end },
        user: userId,
      }).lean();
  
      const productArray = [];
      salesData.forEach((item) => {
        item.product.forEach((product) => {
          productArray.push(product);
        });
      });
  
      const uniqueProductArray = productArray.reduce((acc, product) => {
        const existingProduct = acc.find((p) => p.id === product.id);
  
        if (existingProduct) {
          existingProduct.qty += parseInt(product.qty);
          existingProduct.totalPrice += parseInt(product.qty) * parseInt(product.price);
        } else {
          acc.push({
            id: product.id,
            title: product.title,
            qty: parseInt(product.qty),
            price: parseFloat(product.price),
          totalPrice: parseFloat(product.qty) * parseFloat(product.price)
          });
        }
        return acc;
      }, []);
  
      uniqueProductArray.forEach((product) => {
        product.price = parseFloat((product.totalPrice / product.qty).toFixed(2));
        product.totalPrice = parseFloat(product.totalPrice.toFixed(2));
      });
  
      res.json({ salesProduct: uniqueProductArray });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Function to format the date as "YYYY-MM-DD"
  function formatDate(date) {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }




module.exports = router


