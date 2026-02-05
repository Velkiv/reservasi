import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export function verifyToken(req: Request, res: Response, next: NextFunction) {

    const bearerToken = req.headers.authorization;
    
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) 
    throw new Error("JWT_SECRET belum diset di .env");

    if (!bearerToken) {
        return res.status(400).json({message : "Unauthorized token"})
    }
    const token = bearerToken.slice("Bearer ".length).trim();

    try {
        const decoded = jwt.verify(token, secret)
        if (!decoded?.sub){
            return res.status(401).json({ message: "Token tidak valid (payload sub tidak ada)" });
        }
        return next();
    } catch (err) {
        res.status(401).json({message: "Invalid Token"})
    }
}