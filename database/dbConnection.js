import mongoose from "mongoose";

export const dbConnection= ()=>{
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,

    }).then(()=>{
        console.log("Connected to Database");
    }).catch((err)=>{
        console.log(`Some error Occured While Connecting to Database: ${err}`);
    })
}