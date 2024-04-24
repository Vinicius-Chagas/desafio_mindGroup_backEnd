import express, { Request, Response } from "express";
import authenticateToken from "./middleware/authMiddleware";
import multer from 'multer';
import cors from 'cors';
import newStock from "./estoque/EstoqueController";
import loginUser from "./login/LoginController";
import registerUser from "./login/RegisterController";
import attProduct from "./product/AttProductController";
import getOneProduct from "./product/GetOneProductController";
import deleteProduct from "./product/DeleteProductController";
import getProducts from "./product/GetProductsController";
import getProductsEstoque from "./product/GetProductsEstoqueController";
import newProduct from "./product/NewProductController";


const app = express();
app.use(express.json({ limit: '10MB'}));
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

app.post("/register", registerUser);

app.post('/login', loginUser);

app.put('/attProduct',authenticateToken , upload.single('image'), attProduct);

app.get('/product/:id',authenticateToken , getOneProduct);

app.delete('/product/:id',authenticateToken , deleteProduct);

app.get('/products',authenticateToken , getProducts);

app.get('/productsEstoque',authenticateToken , getProductsEstoque);

app.post('/estoque',authenticateToken , newStock);

app.post('/product',authenticateToken , upload.single('image'), newProduct);    

app.listen(8080, () => console.log('Server listening on port 8080'));
