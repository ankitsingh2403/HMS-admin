import mongoose from "mongoose";
import validator from "validator";

const messageSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:[3,"First Name must Contain atleast three Characters"]
    },
    lastName:{
        type:String,
        required:true,
        minLength:[3,"Last Name must Contain atleast three Characters"]
    },
    email:{
        type:String,
        required:true,
        validate:[validator.isEmail,"Please Provide a valid email"]
    },
    phone:{
        type:String,
        required:true,
        minLength:[10,"Phone number must Contain exact 10 digits"],
        maxLength:[10,"Phone number must Contain exact 10 digits"]
    },
    message:{
        type:String,
        required:true,
        minLength:[10,"Message Must Contain Atleast 10 character"],
    },

});

export const Message=mongoose.model("Message",messageSchema);