import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";

export default async function deleteProduct(req: Request, res: Response){

    
    try {
                
        const  idString  = await req.params.id;
    
        let id: number | null = null;

        if(idString){
            id = parseInt(idString);
        }

        if(id != null){
            await prismaConnection.tb_estoque.deleteMany({where: {id_produto: id}});
            await prismaConnection.tb_produto.deleteMany({where: {id}});
            
            res.status(200);
        }
        else {
            throw new Error();
        }
        
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "A deleção do produto falhou"});
    }
}