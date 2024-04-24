import prismaConnection from "../libs/mysql";
import express, { Request, Response } from "express";

export default async function newStock(req: Request, res: Response){
    const {idString, additionString}:{idString:string, additionString:string}  = req.body;
    
    const id = parseInt(idString, 10);
    const adition = parseFloat(additionString);
    
    
    try {
        let oldstock = await prismaConnection.tb_estoque.findUnique({where: {id_produto:id}, select: { total: true }});
    
        if(!oldstock){
            if(adition < 0) return res.status(500).json({ message: "O estoque total não pode ser negativo"});
            oldstock =  await prismaConnection.tb_estoque.create({data: {id_produto:id, total: adition}});
            return res.status(201).json({ message: "Estoque atualizado com sucesso"});
        }
    
        let newTotal = oldstock.total + adition;
    
    
        if(newTotal < 0){
            return res.status(500).json({ message: "O estoque total não pode ser negativo"});
        }
    
        await prismaConnection.tb_estoque.update({
            where:{ id_produto:id },
            data: {total:  newTotal}
        });
    
        res.status(200).json({ message: "Estoque atualizado com sucesso"});
        
    } catch (error) {
        res.status(500).json({ message: "Atualização de estoque falhou" });
    }
};
    