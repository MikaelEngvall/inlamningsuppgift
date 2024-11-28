const express = require("express");
const Product = require("./models/product"); // Import the model

const router = express.Router();

// GET all products
router.get("/api/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// GET product by ID
router.get("/api/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
});

// POST create product
router.post("/api/products", async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
});

// PUT update product
router.put("/api/products/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
});

// DELETE product by ID
router.delete("/api/products/:id", async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).send("Product not found");
    res.status(204).send();
});

// DELETE all products
router.delete("/api/products", async (req, res) => {
    await Product.deleteMany();
    res.status(204).send();
});

// GET search by name
router.get("/api/products", async (req, res) => {
    const products = await Product.find({ name: new RegExp(req.query.name, "i") });
    res.json(products);
});

// GET render HTML
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.send(`
        <html>
            <body>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Category</th>
                    </tr>
                    ${products.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${p.description}</td>
                            <td>${p.price}</td>
                            <td>${p.quantity}</td>
                            <td>${p.category}</td>
                        </tr>
                    `).join("")}
                </table>
            </body>
        </html>
    `);
});

module.exports = router;
