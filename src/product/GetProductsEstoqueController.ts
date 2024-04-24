import { Request, Response } from "express";
import prismaConnection from "../libs/mysql";

export default async function getProductsEstoque(req: Request, res: Response){
    try {
     
        const estoque = await prismaConnection.$queryRaw`SELECT prod.id, prod.nome, prod.descricao, prod.valor, prod.imagem, est.total FROM tb_produto AS prod LEFT JOIN tb_estoque as est ON prod.id = est.id_produto;`;
    
        res.status(200).json({ estoque });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produtos" });
    }
}