import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
     fullName: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },

    avatarUrl: {
        type: String
    },

    bio: {
        type: String
    },
    starredBoards: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Board"
    }]},
    {timestamps: true
});

const User= mongoose.model("User", userSchema, "Users");
export default User;