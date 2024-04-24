import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";
import fs from 'fs';

type attProduct = {
    id?:string;
    name:string;
    description:string;
    value:string;
    image?: Buffer;
}

type buildProduct = {
    id?:number;
    nome:string;
    descricao:string;
    valor:number;
    imagem?: Buffer;
}

export default async function attProduct(req: Request, res: Response){

    
    try {
                
        const { name, description, value, id}: attProduct = await req.body;
     
        let data: buildProduct = { nome: name, descricao: description, valor: parseFloat(value)}
    
        if(req.file){
            data.imagem = fs.readFileSync(req.file.path);
        }
    
        let idNumber: number | null = null;
    
            if(id){
                idNumber = parseInt(id);
            }
    
            if(idNumber != null){
                await prismaConnection.tb_produto.update({where: {id:idNumber},
                    data
                });
                res.status(200).json({ message: "Produto atualizado com sucesso"});
            }
            else{
                throw new Error();
            }
    
        
    
    } catch (error) {
    
        res.status(500).json({ error });
    }
    }