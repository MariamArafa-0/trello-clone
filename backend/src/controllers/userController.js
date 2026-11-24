import User from "../models/User.js";
export const getMe=async(req,res)=>{
    try{
        const user=req.user;
        res.status(200).json({
            user:{
                id:user._id,
                fullName:user.fullName,
                username:user.username,
                email:user.email,
                avatarUrl:user.avatarUrl,
                bio:user.bio
            }
        });

    }catch(error){
        console.error("Error fetching user:",error);
        res.status(500).json({message:"Server error"});
    }
};

export const updateMe=async(req,res)=>{
    try{
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Invalid request body"
            });
        }
        const {fullName,username,avatarUrl,bio}=req.body;
        const user=req.user;

        const allowedFields = ["fullName", "username", "avatarUrl", "bio"];
        const invalidFields=Object.keys(req.body).filter(field=>!allowedFields.includes(field));
        if(invalidFields.length>0){
            return res.status(400).json({
                message:"Invalid fields in request body",
                invalidFields:invalidFields
            });
        }
        if(Object.keys(req.body).length===0){
            return res.status(400).json({
                message:"Provide at least one field to update"
            });
        }

       if (fullName !== undefined) {
            if (typeof fullName !== "string" || !fullName.trim()) {
                return res.status(400).json({
                    message: "Full name must be a non-empty string"
                });
            }
              user.fullName = fullName.trim();
        }
        if (username !== undefined) {
            if (typeof username !== "string" ) {
                return res.status(400).json({
                    message: "Username must be a string"
                });
            }
             user.username = username.trim() || undefined;
        }
        if (avatarUrl !== undefined) {
            if (typeof avatarUrl !== "string") {
                return res.status(400).json({
                    message: "Avatar URL must be a string"
                });
            }
            const value=avatarUrl.trim();
            if(value){
                try{
                    const url= new URL(value);
                    if(!["http:","https:"].includes(url.protocol)){
                        throw new Error("Invalid URL protocol");
                    }
                }catch(error){
                    return res.status(400).json({
                        message:"Invalid avatar URL"
                    });
                }
            }
             user.avatarUrl = value || undefined;
        }
        if (bio !== undefined) {
            if (typeof bio !== "string" ) {
                return res.status(400).json({
                    message: "Bio must be a string"
                });
            }
             user.bio = bio.trim()|| undefined;
        }

        await user.save();

        res.status(200).json({
            message:"User updated successfully",
            user:{
                id:user._id,
                fullName:user.fullName,
                username:user.username,
                email:user.email,
                avatarUrl:user.avatarUrl,
                bio:user.bio
            }
        });

    }catch(error){
        console.error("Error updating user:",error);
         if (error.code === 11000) {
            return res.status(409).json({
                message: "Username is already taken"
            });
        }
         if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid user data"
            });
        }
 
        res.status(500).json({message:"Server error"});
       
    }
}

export const searchUsers=async(req,res)=>{
    try{
        const{q}=req.query;
        if(!q||typeof q !=="string"||!q.trim()){
            return res.status(400).json({
                message:"Invalid search query"
            });
        }
        const searchTerm=q.trim();
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const users=await User.find({
            _id:{ $ne:req.user._id},
            $or:[
                {fullName:{$regex:escapedTerm,$options:"i"}},
                {username:{$regex:escapedTerm,$options:"i"}}
            ]
        }).select("fullName username avatarUrl bio").limit(10);
        res.status(200).json({users});
    }catch(error){
        console.error("Error searching users:",error);
        res.status(500).json({message:"Server error"});
    }
}
