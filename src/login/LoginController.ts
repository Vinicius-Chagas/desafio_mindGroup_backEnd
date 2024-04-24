import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

type login = {
    email: string;
    password: string;
}

export default async function loginUser(req: Request, res: Response){
    const {email, password} : login = req.body;

    try {
        const user = await prismaConnection.tb_usuario.findUnique({where: {email}});

        if(!user) {
            return res.status(401).json({message: 'User not found'});
        }

        const passwordMatch = await bcrypt.compare(password, user.senha);
        if(!passwordMatch) {
            return res.status(401).json({message: 'Invalid password'});
        }

        const token: string = jwt.sign(
            {userid: user.id},
            process.env.JWT_SECRET!,
            {expiresIn: '2h'}
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
}
