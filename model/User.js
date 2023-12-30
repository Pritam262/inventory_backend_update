const mongoose = require("mongoose")

const Usermodel = new mongoose.Schema({
    name:{
        type:String,
        // required: true
    },
    email:{
        type:String,
        // required: true,
        // unique:true
    },
    password:{
        type:String,
        // required: true
    },
    address:{
        type:String,
        // required: true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports =  mongoose.model("User", Usermodel)
