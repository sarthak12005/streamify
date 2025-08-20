import User from '../models/User.js'
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { upsertStreamUser } from '../lib/stream.js';

export const signup = async (req, res) => {
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.staus(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists, please use a different one" })
        }

        const idx = Math.floor(Math.random() * 100) + 1; // index for the avatar
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar
        });

        
        // Here we are creating the Stream user and sending the userdata 
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            })
            console.log(`Stream user created for ${newUser.fullName}`)
        } catch (error) {
            console.log("Error creating Stream user: ", error);
        }

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent 
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(201).json({ success: true, user: newUser });


    } catch (error) {
        console.log("Error in singup Controller", error);
        res.status(500).json({ message: "internal server error" });
    }
}





export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log("email: ", email, "password: ", password);

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Invalid email or password" });

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent 
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        res.status(200).json({success: true, user});

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}




export const logout = async (req, res) => {
    res.clearCookie("jwt")
    res.status(200).json({success: true, message: "Logout Successfully"});
} 


export const onboard = async (req, res) => {
    try {
        const userId = req.user._id;

        const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, {new: true});

        if (!updatedUser) {
            return res.status(400).json({message: "User not found"});
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            })

            console.log(`Stream user updated for ${updatedUser.fullName}`)

        } catch (streamError) {
            console.log("Error updating Stream user during onboarding", streamError.message);
        }

        res.status(200).json({success: true, user: updatedUser});
    } catch (error) {
        console.log("Error in onboard controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}