import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware=async(req,res,next)=>{
    try{
    const authHeader=req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            mesage:"unauthorized, no token provided"
        });
    }

    const token= authHeader.split(" ")[1];

    const decoded=jwt.verify(token,process.env.JWT_SECRET);

    const user =await User.findById(decoded.userId);

    if(!user){
        return res.status(401).json({
            message:"unauthorized, user not found"
        });
    }

    req.user=user;

    next();
    }
    catch(error){
        res.status(401).json({
            message:"unauthorized, invalid token"
        });
    }
}