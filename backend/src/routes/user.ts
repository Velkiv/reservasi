import { prisma } from "../../lib/prisma";
import express from 'express';
import bcrypt from 'bcrypt';
import { verifyToken } from "../middlewares/auth";

const router = express.Router()
const saltround = 10

router.use(verifyToken)

router.get('/user', async (req, res) => {
    const users = await prisma.users.findMany()

    res.status(200).json(users)
})

router.post('/user', async (req, res) => {
    try {
        const {name, email, hashpass, role} = req.body;

        if (!name || !email || !hashpass) {
            return res.status(404).json({message: "Please insert something."})          
        }

        const user = await prisma.users.create({
            data: {
                name: name,
                email: email,
                hashpass: await bcrypt.hash(hashpass,saltround),
                role: role
            }, select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        
        if(!user) {
            return res.status(400).json({message:"Creation failed"})
        }

        return res.status(201).json(user);
    } catch {
        console
    }

})

router.put('/user/:id', async (req,res)=>{
    const {id} = req.params;
    const {name, email, hashpass, role} = req.body;

    const user = await prisma.users.update({
        where: {
            id: Number(id)
        },
        data: {
            name: name,
            email: email,
            hashpass: hashpass,
            role: role
        }
    });

    res.status(200).json(user);
})

router.delete('/user/:id', async (req, res) => {
    const { id } = req.params;

    const user = await prisma.users.delete({
        where: {
            id: Number(id)
        }
    })

    res.status(200).json(user)

})

export default router;