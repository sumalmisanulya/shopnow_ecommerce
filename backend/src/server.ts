import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import React from "react";
import ReactPDF from "@react-pdf/renderer";
import bcrypt from "bcryptjs";
import { stripe } from "./lib/stripe";
import { prisma } from "./lib/prisma";
import { MOCK_PRODUCTS, getDbSafe } from "./lib/mockData";
import InvoicePDF from "./components/InvoicePDF";

dotenv.config();

const TEMP_MOCK_USERS: any[] = [];

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// API: Auth register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let createdUser = null;
    let dbFailed = false;
    try {
      createdUser = await prisma.user.create({
        data: {
          name: name || "Customer",
          email,
          password: hashedPassword,
          role: "CUSTOMER",
        },
      });
    } catch (dbError) {
      console.warn("Database user creation failed, falling back to memory store:", dbError);
      dbFailed = true;
    }

    if (dbFailed || !createdUser) {
      // Check if email already exists in temp store
      const exists = TEMP_MOCK_USERS.find((u) => u.email === email);
      if (exists) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const newUser = {
        id: `mock-user-${Date.now()}`,
        name: name || "Customer",
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      };
      TEMP_MOCK_USERS.push(newUser);
      createdUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      };
    }

    return res.status(201).json(createdUser);
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API: Auth login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    let user = null;
    let dbFailed = false;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.warn("Database lookup failed, using mock credentials fallback:", dbError);
      dbFailed = true;
    }

    if (!user || dbFailed) {
      // Check temp in-memory user registry first
      const tempUser = TEMP_MOCK_USERS.find((u) => u.email === email);
      if (tempUser) {
        const passwordsMatch = await bcrypt.compare(password, tempUser.password);
        if (passwordsMatch) {
          return res.json({
            id: tempUser.id,
            name: tempUser.name,
            email: tempUser.email,
            role: tempUser.role,
          });
        }
      }

      // Fallback mock accounts
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

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (passwordsMatch) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }

    return res.status(401).json({ error: "Invalid credentials" });
  } catch (error: any) {
    console.error("Auth login error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API: Get products catalog
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock } = req.query;

    const products = await getDbSafe(
      async () => {
        const whereClause: any = { active: true };

        if (category) {
          whereClause.category = { slug: category as string };
        }

        if (search) {
          whereClause.OR = [
            { name: { contains: search as string } },
            { description: { contains: search as string } },
          ];
        }

        if (minPrice || maxPrice) {
          whereClause.price = {};
          if (minPrice) whereClause.price.gte = parseFloat(minPrice as string);
          if (maxPrice) whereClause.price.lte = parseFloat(maxPrice as string);
        }

        if (inStock === "true") {
          whereClause.stock = { gt: 0 };
        }

        return await prisma.product.findMany({
          where: whereClause,
          include: { category: true },
          orderBy: { createdAt: "desc" },
        });
      },
      MOCK_PRODUCTS.filter((prod) => {
        if (category && prod.categoryId !== `cat-${category}` && prod.categoryName.toLowerCase() !== (category as string).toLowerCase()) {
          if (!prod.slug.includes(category as string) && !prod.categoryId.includes(category as string)) return false;
        }
        if (search) {
          const query = (search as string).toLowerCase();
          const matchesName = prod.name.toLowerCase().includes(query);
          const matchesDesc = prod.description.toLowerCase().includes(query);
          if (!matchesName && !matchesDesc) return false;
        }
        if (minPrice && prod.price < parseFloat(minPrice as string)) return false;
        if (maxPrice && prod.price > parseFloat(maxPrice as string)) return false;
        if (inStock === "true" && prod.stock <= 0) return false;
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
      }))
    );

    return res.json(products);
  } catch (error: any) {
    console.error("Get products error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API: Get product detail
app.get("/api/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await getDbSafe(
      async () => {
        const dbProd = await prisma.product.findUnique({
          where: { slug },
          include: { category: true },
        });
        if (!dbProd) return null;
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
      },
      MOCK_PRODUCTS.find((p) => p.slug === slug) || null
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(product);
  } catch (error: any) {
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
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === "mock_secret_key" ||
      process.env.STRIPE_SECRET_KEY === ""
    ) {
      return res.json({ mock: true });
    }

    const lineItems = items.map((item: any) => ({
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        userId,
        items: JSON.stringify(
          items.map((i: any) => ({
            id: i.id,
            quantity: i.quantity,
            price: i.price,
          }))
        ),
      },
    });

    return res.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe session creation error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API: Download Invoice
app.get("/api/invoices/download", async (req, res) => {
  try {
    const orderCode = (req.query.orderCode as string) || "SN-100000";

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const customerName = (req.query.customerName as string) || "John Doe";
    const customerEmail = (req.query.customerEmail as string) || "customer@shopnow.com";
    const address = (req.query.address as string) || "123 Creative Studio, Design District, NY 10001";
    const totalPrice = req.query.totalPrice ? parseFloat(req.query.totalPrice as string) : 333.98;

    let items = [
      {
        name: "Acoustic Pro ANC Headphones",
        quantity: 1,
        price: 299.99,
      },
    ];
    if (req.query.items) {
      try {
        items = JSON.parse(req.query.items as string);
      } catch (err) {
        console.error("Failed to parse items from query:", err);
      }
    }

    const doc = React.createElement(InvoicePDF, {
      orderCode: orderCode,
      date: date,
      items: items,
      customerName: customerName,
      customerEmail: customerEmail,
      address: address,
      totalPrice: totalPrice,
    });

    const stream = await ReactPDF.renderToStream(doc as any);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="invoice-${orderCode}.pdf"`);

    stream.pipe(res);
  } catch (error: any) {
    console.error("PDF generation stream error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
