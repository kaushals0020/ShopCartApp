const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["https://shopcart.vercel.app"], // replace with your actual frontend Vercel URL
  credentials: true
}));

// MongoDB Connection
mongoose.connect("mongodb+srv://kaushalsc9098:778187@cluster1.qjzxdyy.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Multer Setup for Image Upload
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

// Upload API
app.post("/upload", upload.single('product'), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
  res.json({
    success: 1,
    image_url: imageUrl
  });
});

// Auth middleware
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// User Schema
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now }
});

// Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true }
});

// API Routes
app.get("/", (req, res) => res.send("ShopCart Backend Running"));

app.post('/login', async (req, res) => {
  let success = false;
  const user = await Users.findOne({ email: req.body.email });
  if (user && user.password === req.body.password) {
    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');
    success = true;
    return res.json({ success, token });
  }
  return res.status(400).json({ success, errors: "Incorrect email/password" });
});

app.post('/signup', async (req, res) => {
  let success = false;
  const check = await Users.findOne({ email: req.body.email });
  if (check) return res.status(400).json({ success, errors: "Email already registered" });

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart
  });
  await user.save();
  const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
  success = true;
  res.json({ success, token });
});

app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  const arr = products.slice(1).slice(-8);
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find({ category: "women" });
  const arr = products.slice(6, 10);
  res.send(arr);
});

app.post('/addtocart', fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.updateOne({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added");
});

app.post('/removefromcart', fetchuser, async (req, res) => {
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] !== 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.updateOne({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
});

app.post('/getcart', fetchuser, async (req, res) => {
  const userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.post("/addproduct", async (req, res) => {
  const products = await Product.find({});
  const id = products.length ? products[products.length - 1].id + 1 : 1;
  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  await product.save();
  res.json({ success: true, name: req.body.name });
});

app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// Start server
app.listen(port, () => console.log(`Server Running on port ${port}`));
