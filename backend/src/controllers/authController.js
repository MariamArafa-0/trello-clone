import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser=async (req,res)=>{
    try{
        const {fullName,username,email,password}=req.body;

        if(!fullName || !email || !password){
            return res.status(400).json({message:"Please fill in all required fields"});
        }
        if (typeof fullName !== "string" ||typeof email !== "string" ||typeof password !== "string" ||(username !== undefined && typeof username !== "string")){
            return res.status(400).json({ message: "Invalid input" });
        }

        const normalizedEmail=email.trim().toLowerCase();
        const normalizedUsername=username?.trim();

        const existingUser=await User.findOne({
            email:normalizedEmail
        });

        if(existingUser){
            return res.status(409).json({message:"Email is already registered"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const user=await User.create({
            fullName:fullName.trim(),
            ...(normalizedUsername && {username:normalizedUsername}),
            email:normalizedEmail,
            passwordHash:hashedPassword
        });
        
        res.status(201).json({
            message:"Registration Successful",
            user:{
                id:user._id,
                fullName:user.fullName,
                username:user.username,
                email:user.email,
                avatarUrl:user.avatarUrl,
                bio:user.bio
            }
        })
    }
    catch(error){
        if(error.code ===11000){
            return res.status(409).json({message:"Email or username is already registered"});
        }
        console.error("Registration error:", error);
        res.status(500).json({message:"Server error"});
    }
};

export const loginUser=async(req,res)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password){
            return res.status(400).json({message:"Please fill in all required fields"});
        }

        const user=await User.findOne({
            email:email.trim().toLowerCase()
        }).select("+passwordHash");

        if(!user){
            return res.status(401).json({message:"Invalid email or password"});
        }

        const isPasswordValid= await bcrypt.compare(password,user.passwordHash);

        if(!isPasswordValid){
            return res.status(401).json({message:"Invalid email or password"});
        }

        const token=jwt.sign({userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"});

        res.status(200).json({message:"Login successful",token,
            user:{
                id:user._id,
                fullName:user.fullName,
                username:user.username,
                email:user.email,
                avatarUrl:user.avatarUrl,
                bio:user.bio
            }
        });
    }
    catch(error){
        console.error("Login error:",error);
        res.status(500).json({message:"Server error"});
    }
}