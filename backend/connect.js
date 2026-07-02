require("dotenv").config();
const mongoose=require("mongoose");

//create database connection
const connectToMongoDB=()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected");
        
        
    }).catch((err) => {
        console.log(err);
        
        
    });

} 
connectToMongoDB()

module.exports={connectToMongoDB}