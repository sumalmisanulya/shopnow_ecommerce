"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const react_1 = __importDefault(require("react"));
const renderer_1 = __importDefault(require("@react-pdf/renderer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const stripe_1 = require("./lib/stripe");
const prisma_1 = require("./lib/prisma");
const mockData_1 = require("./lib/mockData");
const InvoicePDF_1 = __importDefault(require("./components/InvoicePDF"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
// API: Auth login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Missing email or password" });
        }
        // Mock database fallback for testing if database is not reachable
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("localhost:51214")) {
            if (email === "admin@shopnow.com" && password === "admin123") {
                return res.json({
                    id: "admin-id",
                    name: "Admin User",
                    email: "admin@shopnow.com",
                    role: "ADMIN",
                });
            }
            if (email === "customer@shopnow.com" && password === "customer123") {
                return res.json({
                    id: "customer-id",
                    name: "John Doe",
                    email: "customer@shopnow.com",
                    role: "CUSTOMER",
                });
            }
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const passwordsMatch = await bcryptjs_1.default.compare(password, user.password);
        if (passwordsMatch) {
            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        }
        return res.status(401).json({ error: "Invalid credentials" });
    }
    catch (error) {
        console.error("Auth login error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});
// API: Get products catalog
app.get("/api/products", async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, inStock } = req.query;
        const products = await (0, mockData_1.getDbSafe)(async () => {
            const whereClause = { active: true };
            if (category) {
                whereClause.category = { slug: category };
            }
            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            if (minPrice || maxPrice) {
                whereClause.price = {};
                if (minPrice)
                    whereClause.price.gte = parseFloat(minPrice);
                if (maxPrice)
                    whereClause.price.lte = parseFloat(maxPrice);
            }
            if (inStock === "true") {
                whereClause.stock = { gt: 0 };
            }
            return await prisma_1.prisma.product.findMany({
                where: whereClause,
                include: { category: true },
                orderBy: { createdAt: "desc" },
            });
        }, mockData_1.MOCK_PRODUCTS.filter((prod) => {
            if (category && prod.categoryId !== `cat-${category}` && prod.categoryName.toLowerCase() !== category.toLowerCase()) {
                if (!prod.slug.includes(category) && !prod.categoryId.includes(category))
                    return false;
            }
            if (search) {
                const query = search.toLowerCase();
                const matchesName = prod.name.toLowerCase().includes(query);
                const matchesDesc = prod.description.toLowerCase().includes(query);
                if (!matchesName && !matchesDesc)
                    return false;
            }
            if (minPrice && prod.price < parseFloat(minPrice))
                return false;
            if (maxPrice && prod.price > parseFloat(maxPrice))
                return false;
            if (inStock === "true" && prod.stock <= 0)
                return false;
            return true;
        }).map((prod) => ({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            price: prod.price,
            stock: prod.stock,
            images: prod.images,
            active: prod.active,
            categoryId: prod.categoryId,
            createdAt: new Date(),
            updatedAt: new Date(),
            category: {
                id: prod.categoryId,
                name: prod.categoryName,
                slug: prod.categoryId.replace("cat-", ""),
            },
        })));
        return res.json(products);
    }
    catch (error) {
        console.error("Get products error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});
// API: Get product detail
app.get("/api/products/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await (0, mockData_1.getDbSafe)(async () => {
            const dbProd = await prisma_1.prisma.product.findUnique({
                where: { slug },
                include: { category: true },
            });
            if (!dbProd)
                return null;
            return {
                id: dbProd.id,
                name: dbProd.name,
                slug: dbProd.slug,
                description: dbProd.description,
                price: dbProd.price,
                stock: dbProd.stock,
                images: dbProd.images,
                categoryId: dbProd.categoryId,
                categoryName: dbProd.category.name,
            };
        }, mockData_1.MOCK_PRODUCTS.find((p) => p.slug === slug) || null);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        return res.json(product);
    }
    catch (error) {
        console.error("Get product detail error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});
// API: Checkout
app.post("/api/checkout", async (req, res) => {
    try {
        const { items, userId } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "Missing cart items" });
        }
        // If Stripe secret key is not set, let the client proceed via mock checkout flow
        if (!process.env.STRIPE_SECRET_KEY ||
            process.env.STRIPE_SECRET_KEY === "mock_secret_key" ||
            process.env.STRIPE_SECRET_KEY === "") {
            return res.json({ mock: true });
        }
        const lineItems = items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));
        const origin = req.get("origin") || process.env.FRONTEND_URL || "http://localhost:3000";
        const session = await stripe_1.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart`,
            metadata: {
                userId,
                items: JSON.stringify(items.map((i) => ({
                    id: i.id,
                    quantity: i.quantity,
                    price: i.price,
                }))),
            },
        });
        return res.json({ url: session.url });
    }
    catch (error) {
        console.error("Stripe session creation error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});
// API: Download Invoice
app.get("/api/invoices/download", async (req, res) => {
    try {
        const orderCode = req.query.orderCode || "SN-100000";
        const date = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        const doc = react_1.default.createElement(InvoicePDF_1.default, {
            orderCode: orderCode,
            date: date,
            items: [
                {
                    name: "Acoustic Pro ANC Headphones",
                    quantity: 1,
                    price: 299.99,
                },
            ],
            customerName: "John Doe",
            customerEmail: "customer@shopnow.com",
            address: "123 Creative Studio, Design District, NY 10001",
            totalPrice: 333.98,
        });
        const stream = await renderer_1.default.renderToStream(doc);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="invoice-${orderCode}.pdf"`);
        stream.pipe(res);
    }
    catch (error) {
        console.error("PDF generation stream error:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
