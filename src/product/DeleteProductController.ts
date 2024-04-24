import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";

export default async function deleteProduct(req: Request, res: Response){

    try {
                
        const  id  = +req.params.id;

        if(id != null){
            await prismaConnection.tb_estoque.deleteMany({where: {id_produto: id}});
            await prismaConnection.tb_produto.delete({where: {id}});
            
            res.status(200).json({ success:true });
        }
        else {
            throw new Error();
        }
        
    
    } catch (error) {
        res.status(500).json({ error: "A deleção do produto falhou"});
    }
}