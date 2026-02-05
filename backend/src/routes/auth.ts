import 'dotenv/config'
import { prisma } from "../../lib/prisma";
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const router = express.Router();
const secret = process.env.JWT_SECRET_KEY;
if (!secret) 
    throw new Error("JWT_SECRET belum diset di .env");

router.post('/auth/login', async (req, res)=> {
    try{
        const { inputpass, email } = req.body
        
        if ( !inputpass || !email){
            return res.status(401).json({ message: "Password dan E-mail diperlukan"})
        }

        const user = await prisma.users.findUnique({
            where: {
                email: email,
            }, select: {
                id: true,
                hashpass: true,
                name: true,
                role: true
            }
        });

        if (!user) {
            return res.status(400).json({message: "Login failed"})
        };

        const validity = await bcrypt.compare(inputpass, user.hashpass);
        
        if (!validity) {
            return res.status(400).json({message: "Email dan password salah!"})
        };

        const {hashpass, ...safeUser} = user;

        const token = jwt.sign(
            {sub: user.id, role: user.role},
            secret,
            {algorithm: "HS256", expiresIn:"1h"}
        )

        res.cookie("access-token", token)

        return res.status(200).json({token, user : {id: user.id, name: user.name, }});

    } catch (err) {
        return res.status(500).json({message: "Internal Server Error"});
    }
})

router.post('/auth/logout', async (req, res) => {
    try{
        res.clearCookie("access-token", {
            httpOnly: true,
            path: "/"
        })

        return res.status(200).json({message: "Logged out."})
    } catch {
        return res.status(400).json({message: "Error server"})
    }
})

export default router;