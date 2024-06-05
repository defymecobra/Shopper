const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error, log } = require("console");
const { request } = require("http");

app.use(express.json());
app.use(cors());

//Database Connection With MongoDB
mongoose.connect("mongodb+srv://defymecobra:htghjr20102005@cluster0.itxlqhh.mongodb.net/brandshop");

//API Creation
app.get("/",(req, res)=>{
    res.send("Express app is running");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({storage:storage});

//Creating upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post("/upload", upload.single('product'), (req, res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    });
});

//Schema for creating products
const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type: Number,
        required:true,
    },
    old_price:{
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    description:{
        type:String,
        required:true,
    },
    size:{
        type:String,
        required:true,
    }
});

//Creating API for adding products
app.post('/addproduct', async (req, res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
        description:req.body.description,
        size:req.body.size
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    });
});

//Creating API for deleting products
app.post('/removeproduct', async (req, res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name,
    });
});

//Creating API for getting all products
app.get('/allproducts', async (req, res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
});

// API для получения имени продукта по его идентификатору
app.get('/getproductname/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        const product = await Product.findOne({ id: productId });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        console.log("Product Found", product);
        res.json({
            success: true,
            productName: product.name,
            productSize: product.size
        });
    } catch (error) {
        console.error("Error fetching product name:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//Shema creating for User model
const Users = mongoose.model('Users', {
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object
    },
    date:{
        type:Date,
        default:Date.now
    }
});

//Creating endpoint for registration the user
app.post('/signup', async(req, res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false, error:"existing user found with same email address"});
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token});
});

//Creating endpoint  for user login
app.post('/login', async (req, res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom');
            res.json({success:true, token});
        }
        else{
            res.json({succes:false, error:"wrong password"});
        }
    }
    else{
        res.json({succes:false, error:"wrong email"});
    }
});

//Creating endpoint for newcollection data
app.get('/newcollections', async (req, res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection fetched");
    res.send(newcollection);
});

//Creating endpoint for popular in women section
app.get('/popularinwomen', async(req, res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
});

//Creating middleware to fetch user
const fetchUser = async(req, res, next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate using a valid token"})
    }
    else{
        try{
            const data = jwt.verify(token, 'secret_ecom')
            req.user = data.user;
            next();
        }
        catch(error){
            res.status(401).send({error:"Please authenticate using a valid token"})
        }
    }
}

//Creating endpoint for adding products in cartdata
app.post('/addtocart',  fetchUser, async(req, res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
    res.send("Added");
    console.log("added", req.body.itemId)
});

//Creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async(req, res)=>{
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData:userData.cartData});
    res.send("Removed");
    console.log("removed", req.body.itemId);
});

//Creating endpoint to get cartdata
app.post('/getcart', fetchUser, async(req, res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})

//Shema creating for Order model
const Order = mongoose.model('Order', {
    id:{
        type: Number,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    totalcost:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        required:true,
    },
    cartData:{
        type:Object
    },
    date:{
        type:Date,
        default:Date.now
    },
});

//Creating API for adding orders
app.post('/addorder', async (req, res)=>{
    let orders = await Order.find({});
    let id;
    if(orders.length>0){
        let last_order_array = orders.slice(-1);
        let last_order = last_order_array[0];
        id = last_order.id+1;
    }
    else{
        id=1;
    }
    const order = new Order({
        id:id,
        email:req.body.email,
        totalcost:req.body.totalcost,
        status:req.body.status,
        cartData:req.body.cartData
    });
    console.log(order);
    await order.save();
    console.log("Saved");
    res.json({
        success:true,
        status:req.body.status,
    });
});

// Creating API for accepting orders
app.post('/acceptorder', async (req, res) => {
    const orderId = req.body.id;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { id: orderId },
            { status: "Accepted" },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log("Order Accepted", updatedOrder);
        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error accepting order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


//Creating API for rejecting orders
app.post('/rejectorder', async (req, res)=>{
    const orderId = req.body.id;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { id: orderId },
            { status: "Rejected" },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        console.log("Order Rejected", updatedOrder);
        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error accepting order:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//Creating API for getting all orders
app.get('/allorders', async (req, res)=>{
    let orders = await Order.find({});
    console.log("All Orders Fetched");
    res.send(orders);
});

const server = app.listen(port, (error) => {
    if (!error) {
      console.log("Server running on port: " + port);
    } else {
      console.log("Error: " + error);
    }
  });

module.exports = { app, server };