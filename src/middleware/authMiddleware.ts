import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export default function authenticateToken(req: Request, res: Response, next: NextFunction){

    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message: "No token provided"});
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) return res.sendStatus(403);

        next();

    });
}
