import {catchAsyncError} from "../middleware/catchAsyncError.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister=catchAsyncError(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,aadhar,role}=req.body;
    if(!firstName || !lastName || !email || !phone || !password|| !gender || !dob || !aadhar || !role){
        return next(new ErrorHandler("Please fill Full form",400));
    }

    let user=await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User Already registered",400))
    }
    user=await User.create({firstName,lastName,email,phone,password,gender,dob,aadhar,role});
    generateToken(user,"User registered",200,res);
    // res.status(200).json({
    //     success:true,
    //     message:"User registered",

    // });
})

export const login=catchAsyncError(async (req,res,next)=>{
    const{email,password,confirmPassword,role}=req.body;
    if(!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("Please provide all details",400));

    }
    if(password!==confirmPassword){
        return next(new ErrorHandler("Password And Confirm Password do not match",400));

    }

    const user=await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Password or Email",400));

    }
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Password or Email",400));

    }
    if(role!==user.role){
        return next(new ErrorHandler("user with this role not found",400));

    }
    generateToken(user,"User Logged in successfully",200,res);
    // res.status(200).json({
    //     success:true,
    //     message:"User Logged in successfully",

    // });

})

export const addNewAdmin=catchAsyncError(async(req,res,next)=>{
    const{firstName,lastName,email,phone,password,gender,dob,aadhar,role="Admin"}=req.body;
    if(!firstName || !lastName || !email || !phone || !password|| !gender || !dob || !aadhar || !role){
        return next(new ErrorHandler("Please fill Full form",400));
    }
    const isRegistered=await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} With this email already registered`));
    }
    const admin=await User.create({firstName,lastName,email,phone,password,gender,dob,aadhar,role:"Admin"});
    res.status(200).json({
        success:true,
        message:"New Admin Registered"
    })
    
})

export const getAllDoctors=catchAsyncError(async(req,res,next)=>{
    const doctors=await User.find({role:"Doctor"});
    res.status(200).json({
        success:true,
        doctors,
    });
});

export const getUserDetails=catchAsyncError(async(req,res,next)=>{
    const user=req.user;
    res.status(200).json({
        success:true,
        user,
    });
});

export const logoutAdmin=catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("adminToken","",{
        httpOnly:true,
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"Admin Logged Out Successfully"
    });
});

export const logoutPatient=catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("patientToken","",{
        httpOnly:true,
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"Patient Logged Out Successfully"
    });
});

export const addNewDoctor=catchAsyncError(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("Doctor Avatar Required",400));
    }
    const {docAvatar}=req.files;
    const allowedFormats=["image/png","image/jpeg","image/webp"];
    if(!allowedFormats.includes(docAvatar.mimetype)){
        return next(new ErrorHandler("File format not supported"));

    }
    const {firstName,lastName,email,phone,password,gender,dob,aadhar,doctorDepartment,}= req.body;
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !aadhar || !doctorDepartment){
        return next(new ErrorHandler("Please fill all Details"),400);
    }
    const isRegistered=await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email`),400);
    }
    const cloudinaryResponse=await cloudinary.v2.uploader.upload(docAvatar.tempFilePath);
    console.log("CloudinaryResponse=>",cloudinaryResponse);
    if(!cloudinaryResponse || cloudinary.error){
        console.log("cloudinary ERROR",cloudinaryResponse.error || "Unknown Cloudinary error")

    }
    const doctor=await User.create({firstName,lastName,email,phone,password,gender,dob,aadhar,doctorDepartment,role:"Doctor",docAvatar:{
        public_id:cloudinaryResponse.public_id,
        url:cloudinaryResponse.secure_url,
    }});
    res.status(200).json({
        success:true,
        message:"New Doctor Registered",
        doctor
    })
})