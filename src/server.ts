import prismaConnection from "./libs/mysql";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

type user = {
    name: string;
    email: string;
    password: string;
}


type login = {
    email: string;
    password: string;
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
})

app.listen(8080, () => console.log('Server listening on port 8080'));