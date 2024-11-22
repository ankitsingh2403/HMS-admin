// const express=require("express");
// const app=express();

import express from "express";
import {config} from "dotenv";
import path from 'path';
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import {errorMiddleware} from "./middleware/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";

const app=express();
config({path:"./config/config.env"})
//middleware to connect front end with backend
app.use(cors({
    origin:[process.env.FRONTEND_URL,process.env.DASHBOARD_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
})
);

//middleWare for cookie-parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/temp/"
}));
dbConnection();

app.use("/api/v1/message",messageRouter);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/appointment",appointmentRouter);


app.use(express.static(path.join(path.resolve(), '/client/dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(path.resolve(), '/client/dist/index.html'));
});

app.use(errorMiddleware)
export default app;