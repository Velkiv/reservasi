import { prisma } from "../../lib/prisma";
import express from "express";
import { verifyToken } from "../middlewares/auth";

const router = express.Router()

router.use(verifyToken)

router.get('/reservasi', async (_,res)=> {
    const reservasi = await prisma.reservasi.findMany({
        include :{
            pasien: {
                select: {
                    namaPasien: true,
                }
            }
        }
    })

    res.status(200).json(reservasi)
})

router.get('/reservasi/:id', async (req, res) => {
    const { id } = req.params
    const reservasi = await prisma.reservasi.findUnique({
        where: {
            id: Number(id)
        }, include: {
            pasien: {
                select: {
                    namaPasien: true
                }
            }
        }}
    )
    res.status(200).json(reservasi)
})

router.post('/reservasi', async (req,res)=> {
    const {pasienId, start_at, finish_at, description, status} = req.body

    const reservasiBaru = await prisma.reservasi.create({
        data: {
            pasienId: pasienId,
            start_at: start_at,
            finish_at: finish_at,
            description: description,
            status: status,
        }
    })
    res.status(201).json(reservasiBaru)
})

router.put('/reservasi/:id', async (req, res) => {
    const { id } = req.params
    const {pasienId, start_at, finish_at, description, status} = req.body
    
    const reservasi = await prisma.reservasi.update({
        where: {
            id: Number(id),
        },
        data : {
            pasienId: pasienId,
            start_at: start_at,
            finish_at: finish_at,
            description: description,
            status: status,
        }
    })
    res.status(200).json(reservasi)
})

router.delete('/reservasi/:id', async (req, res) => {
    const { id } = req.params
    const reservasi = await prisma.reservasi.delete({
        where: {
            id : Number(id)
        }
    })
    res.status(200).json(reservasi)
})

export default router;