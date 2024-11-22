import {catchAsyncError} from "../middleware/catchAsyncError.js"
import ErrorHandler, {errorMiddleware} from "../middleware/errorMiddleware.js"
import {Appointment} from "../models/appointmentSchema.js"
import {User} from "../models/userSchema.js"

export const postAppointment=catchAsyncError(async(req,res,next)=>{
    const {firstName,lastName,email,phone,aadhar,gender,appointment_date,department,doctor_firstName,doctor_lastName,hasVisited,address,dob}=req.body;
    if(!firstName || !lastName || !email || !phone || !aadhar || !gender || !appointment_date || !department || !doctor_firstName || !doctor_lastName  || !address || !dob){
        return next(new ErrorHandler("Please fill All the details"),400);

    }
    const isConflict=await User.find({
        firstName:doctor_firstName,
        lastName:doctor_lastName,
        role:"Doctor",
        doctorDepartment:department,

    })
    if(isConflict.length===0){
        return next(new ErrorHandler("Doctor not found"),400);
    }
    if(isConflict.length>1){
        return next(new ErrorHandler("Doctor Conflict Please Contact through email or Phone"),400);
    }
    const doctorId=isConflict[0].id;
    const patientId=req.user._id;
    const appointment=await Appointment.create({firstName,lastName,email,phone,aadhar,gender,appointment_date,department,doctor:{firstName:doctor_firstName,lastName:doctor_lastName},hasVisited,address,doctorId,patientId,dob});
    res.status(200).json({
        success:true,
        message:"Appointment Sent Successfully",
        appointment,

    });

})

export const getAllAppointments=catchAsyncError(async(req,res,next)=>{
    const appointment=await Appointment.find();
    res.status(200).json({
        success:true,
        appointment,
    })
})

export const updateAppointmentStatus=catchAsyncError(async(req,res,next)=>{
        const{id}=req.params;
        let appointment=await Appointment.findById(id);
        if(!appointment){
            return next(new ErrorHandler("Appointment not found"),404);
        }
        appointment=await Appointment.findByIdAndUpdate(id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false,
        });
        res.status(200).json({
            success:true,
            message:"Appointment status updated",
            appointment,
        })
})

export const deleteAppointment=catchAsyncError(async(req,res,next)=>{
    const {id}=req.params;
    let appointment=await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("Appointment not found"),404);
    }
    await appointment.deleteOne();
    res.status(200).json({
        success:true,
        message:"Appointment Deleted",
        
    })

})