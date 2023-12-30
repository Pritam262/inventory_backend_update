const  mongoose = require('mongoose')

// const mongoURI = process.env.MONGO_URI
// const connectToMongo = async ()=>{
//     try {
        
//        await  mongoose.connect(mongoURI)
//             console.log("Connect to mongo successfully")
//         }
    
//     catch (error) {
//         console.log("Mongodb did not connect")
//     }
// }
// module.exports = connectToMongo;



// const { MongoClient } = require("mongodb")

// const connectToMongo =async ()=>{
//     // const MONGO_URI = process.env.MONGO_URI
//     const client = new MongoClient(process.env.MONGO_URI)
//     try {
//         await client.connect()
//         console.log("Mongodb connected")

//     } catch (error) {
//         console.log("Mongodb did not connected")

//     }


// }
// module.exports = connectToMongo;



// Connected to Cluster Atlas MongoDB
const connectToMongo =  async ()=>{
    
        
        if(mongoose.connections[0].readyState){
            console.log("Mongodb already connected")
        }
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongodb Connected")
    
}


module.exports =  connectToMongo;
