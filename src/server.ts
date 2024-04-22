import prismaConnection from "./libs/mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateToken from "./middleware/authMiddleware";
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/'});

const allowedOrigins =['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) return callback(null,true);

        if(allowedOrigins.indexOf(origin)!== -1){
            callback(null,true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    }
}))

type user = {
    name: string;
    email: string;
    password: string;
}


type login = {
    email: string;
    password: string;
}

type product = {
    name:string;
    description:string;
    value:string;
    image?: Buffer;
}

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

type stock = {
    id: number;
    total: number;
}

app.post("/register", async (req: Request, res: Response) => {
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
});

app.post('/login', async (req: Request, res: Response) => {
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
});

app.post('/product', authenticateToken, upload.single('image'), async (req: Request, res: Response) => {
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

    res.status(500).json({ error: "Item creation failed"});
}
});

app.put('/attProduct', authenticateToken, upload.single('image'), async (req: Request, res: Response) => {

    
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

        console.log

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
});

app.get('/product/:id', authenticateToken,  async (req: Request, res: Response) => {

    
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
    });

app.get('/products', authenticateToken, async (req: Request, res: Response) =>{
try {
    const page = parseInt(req.params.page as string) || 1;
    const itemsPerPage = 10;
    
    const products = await prismaConnection.tb_produto.findMany({
        skip: (page -1) * itemsPerPage,
        take:  itemsPerPage
    });



    res.status(200).json({ products });
} catch (error) {
    res.status(500).json({ message: "Erro ao buscar produtos" });
}
});

app.post('/estoque', authenticateToken, async (req: Request, res: Response) =>{
const {idString, additionString}:{idString:string, additionString:string}  = req.body;

const id = parseInt(idString, 10);
const adition = parseFloat(additionString);

console.log({id, adition})

try {
    let oldstock = await prismaConnection.tb_estoque.findUnique({where: {id_produto:id}, select: { total: true }});

    if(!oldstock){
        if(adition < 0) return res.status(500).json({ message: "O estoque total não pode ser negativo"});
        oldstock =  await prismaConnection.tb_estoque.create({data: {id_produto:id, total: adition}});
        return res.status(201).json({ message: "Estoque atualizado com sucesso"});
    }

    let newTotal = oldstock.total + adition;

    console.log(newTotal);

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
});

app.listen(8080, () => console.log('Server listening on port 8080'));