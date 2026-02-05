import { prisma } from "../../lib/prisma";
import express from "express";
import { verifyToken } from "../middlewares/auth";

const router = express.Router()

router.use(verifyToken)

router.get('/pasiens', async (_,res)=> {
    try {
        const pasiens = await prisma.pasien.findMany({
            orderBy: {createdAt: "desc"}
        });
        res.status(200).json(pasiens)
    } catch {
        return res.status(500).json({ message: "Internal Server Error" });
    }
    
})

router.get('/pasiens/:id', async (req, res) => {
    const { id } = req.params
    const pasien = await prisma.pasien.findUnique({
        where: {
            id: Number(id)
        }, 
        include: {
            reservasi: true
        }
    })
    res.status(200).json(pasien)
})

router.post('/pasiens', async (req,res)=> {
    const {namaPasien, nohp} = req.body

    const pasienBaru = await prisma.pasien.create({
        data: {
            namaPasien: namaPasien,
            nohp: nohp
        }
    })
    res.status(201).json(pasienBaru)
})

router.put('/pasiens/:id', async (req, res) => {
    const { id } = req.params
    const { namaPasien, nohp } = req.body
    
    const pasien = await prisma.pasien.update({
        where: {
            id: Number(id),
        },
        data : {
            namaPasien: namaPasien,
            nohp: nohp
        }
    })
    res.status(200).json(pasien)
})

router.delete('/pasiens/:id', async (req, res) => {
    const { id } = req.params
    const pasien = await prisma.pasien.delete({
        where: {
            id : Number(id)
        }
    })
    res.status(200).json(pasien)
})

export default router;