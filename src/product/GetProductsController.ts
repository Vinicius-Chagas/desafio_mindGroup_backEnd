import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";

export default async function getProducts(req: Request, res: Response){
    try {
     
        const products = await prismaConnection.tb_produto.findMany();
    
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produtos" });
    }
}