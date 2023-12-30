const connectToMongo = require("./db")
const express = require('express')
const cors = require('cors')
require('dotenv').config();


connectToMongo()

const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json())

// require("./model/User");

//Available route
app.use("/api/product", require("./api/product"))
app.use("/api/auth", require("./api/auth"))
app.use("/api/sells", require("./api/sells"))
app.use("/api/payment", require("./api/payment"))
app.use("/api/transection", require("./api/transection"))
// app.use("/api/product", require("./api/product"))



app.listen(port, () => {
    console.log(`Example app listing on at http://localhost:${port}`)
})
