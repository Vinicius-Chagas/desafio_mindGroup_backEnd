import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";

export default async function getOneProduct(req: Request, res: Response){
    
    try {
                
        const  idString  = await req.params.id;
    
        let id: number | null = null;

        if(idString){
            id = parseInt(idString);
        }

        if(id != null){
            const product = await prismaConnection.tb_produto.findUnique({where: {id}});
            res.status(200).json({ product });
        }
        else {
            throw new Error();
        }
        
    
    } catch (error) {
    
        res.status(500).json({ error: "A solicitação falhou"});
    }
    }