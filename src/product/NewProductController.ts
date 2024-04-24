import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";
import fs from 'fs';

type product = {
    name:string;
    description:string;
    value:string;
    image?: Buffer;
}

export default async function newProduct(req: Request, res: Response){
    const defaultImage = fs.readFileSync("./src/assets/defaultImage.jpeg");
    
    try {
                
        const { name, description, value}: product = await req.body;
    
        let imageData: Buffer = Buffer.from(defaultImage);

        if(req.file){
            imageData = fs.readFileSync(req.file.path);
        }

        await prismaConnection.tb_produto.create({
            data: {
                nome: name,
                descricao: description,
                valor: parseFloat(value),
                imagem: imageData
            }
        });

        res.status(201).json({ message: "Product created successfully"});

    } catch (error) {

        res.status(500).json({ error: "O cadastro do produto falhou"});
    }
}