import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema({
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
    aadhar:{
        type:String,
        required:true,
        minLength:[12,"AAdhar Must Contain 12 Digits"],
        maxLength:[12,"AAdhar Must Contain 12 Digits"]
    },
    dob:{
        type:Date,
        required:[true,"DOB is Required!"],
    },
    gender:{
        type:String,
        required:true,
        enum:["Male","Female"],
    },
    password:{
        type:String,
        minLength:[8,"Password must Contain atleast 8 characters"],
        required:true,
        select:false,
    },
    role:{
        type:String,
        required:true,
        enum:["Admin","Patient","Doctor"],
    },
    doctorDepartment:{
        type:String,
    },
    docAvatar:{
        public_id:String,
        url:String,
    },


});

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")){
        next();
    }
    this.password= await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.methods.generateJsonWebToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRES,
    });
}






export const User=mongoose.model("User",userSchema);