import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";
import bcrypt from "bcrypt";

type user = {
    name: string;
    email: string;
    password: string;
}


export default async function registerUser(req: Request, res: Response){
    const newUser: user = req.body;

    if(!newUser.name || !newUser.email || !newUser.password) {
        return res.status(400).json({
            error: 'Missing required fields'
        })
    }

    const encryptedPassword = await bcrypt.hash(newUser.password,10);

    try {
        await prismaConnection.tb_usuario.create({
            data: {
                nome: newUser.name,
                email: newUser.email,
                senha: encryptedPassword
            }
        });

        return res.status(201).json({message: 'User created'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error'});
    }
}
