const request = require("supertest");
const app = require("./app"); // Importera appen
const mongoose = require("mongoose");
const Product = require("./models/product"); // Importera produktmodellen

describe("API routes", () => {
    let productId;

    // Körs före alla tester för att skapa en testprodukt
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const product = new Product({
            name: "Test Product",
            description: "This is a test product",
            price: 99.99,
            quantity: 10,
            category: "Test Category"
        });

        const savedProduct = await product.save();
        productId = savedProduct._id.toString();
    });

    // Körs efter alla tester för att rensa databasen
    afterAll(async () => {
        await Product.deleteMany({});
        await mongoose.connection.close();
    });

    it("should fetch all products", async () => {
        const res = await request(app).get("/api/products");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should fetch a product by ID", async () => {
        const res = await request(app).get(`/api/products/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("name", "Test Product");
    });

    it("should create a new product", async () => {
        const res = await request(app).post("/api/products").send({
            name: "New Product",
            description: "A newly created product",
            price: 49.99,
            quantity: 5,
            category: "New Category"
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("name", "New Product");
    });

    it("should update a product by ID", async () => {
        const res = await request(app).put(`/api/products/${productId}`).send({
            name: "Updated Product",
            description: "Updated description",
            price: 89.99,
            quantity: 15,
            category: "Updated Category"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("name", "Updated Product");
    });

    it("should delete a product by ID", async () => {
        const res = await request(app).delete(`/api/products/${productId}`);
        expect(res.statusCode).toBe(204);

        // Kontrollera att produkten verkligen raderades
        const check = await Product.findById(productId);
        expect(check).toBeNull();
    });

    it("should delete all products", async () => {
        const res = await request(app).delete("/api/products");
        expect(res.statusCode).toBe(204);

        // Kontrollera att alla produkter raderades
        const allProducts = await Product.find();
        expect(allProducts.length).toBe(0);
    });

    it("should search for products by name", async () => {
        // Skapa en produkt för sökning
        await Product.create({
            name: "Searchable Product",
            description: "This product is for testing search functionality",
            price: 19.99,
            quantity: 3,
            category: "Search Category"
        });

        const res = await request(app).get("/api/products?name=Searchable");
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty("name", "Searchable Product");
    });
});
