const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MONGODB CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://obs360admin:obs360admin@obs360-blog.jbttdnt.mongodb.net/obs360blog?retryWrites=true&w=majority';
const DB_NAME = 'obs360blog';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(MONGODB_URI, {
        tls: true,
        tlsAllowInvalidCertificates: false,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    });

    await client.connect();
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    console.log('✅ Conectado a MongoDB Atlas');
    return { client, db };
}

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: ['https://obs360.co', 'http://localhost:3000', 'https://obs360.vercel.app'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// ==================== SONDA DE DIAGNÓSTICO ====================
app.get('/api/version/check', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const articlesCount = await db.collection('articles').countDocuments();

        res.json({
            status: 'online',
            version: '3.0.0-MONGODB',
            database: 'MongoDB Atlas',
            articles_count: articlesCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'online',
            version: '3.0.0-MONGODB',
            database: 'Error connecting',
            error: error.message
        });
    }
});

// ==================== AUTENTICACIÓN ====================

// Login Admin
app.post('/api/auth/admin', (req, res) => {
    const { username, password } = req.body;

    const validUsername = process.env.ADMIN_USERNAME || 'obs360admin';
    const validPassword = process.env.ADMIN_PASSWORD || 'Obs.2025$$';

    if (username === validUsername && password === validPassword) {
        res.json({ success: true, message: 'Login exitoso', type: 'admin' });
    } else {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
});

// Login Blog
app.post('/api/auth/blog', (req, res) => {
    const { username, password } = req.body;

    const validUsername = process.env.BLOG_USERNAME || 'obs360admin';
    const validPassword = process.env.BLOG_PASSWORD || 'Obs.2025$$';

    if (username === validUsername && password === validPassword) {
        res.json({ success: true, message: 'Acceso autorizado', type: 'blog' });
    } else {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
    }
});

// ==================== CATEGORÍAS ====================

const DEFAULT_CATEGORIES = [
    { id: 'analisis', name: 'Análisis', icon: '📊', color: '#d1fae5', textColor: '#065f46', isDefault: false },
    { id: 'informe', name: 'Informe Mensual', icon: '💎', color: '#fce7f3', textColor: '#9f1239', isDefault: false },
    { id: 'estrategia', name: 'Estrategia', icon: '🍽️', color: '#dbeafe', textColor: '#1e3a8a', isDefault: false },
    { id: 'capacitacion', name: 'Capacitación', icon: '🎓', color: '#fef3c7', textColor: '#92400e', isDefault: false },
    { id: 'herramientas', name: 'Herramientas', icon: '🛠️', color: '#e0e7ff', textColor: '#3730a3', isDefault: false },
    { id: 'otras', name: 'Otras', icon: '📁', color: '#f3f4f6', textColor: '#374151', isDefault: true }
];

// GET Categories
app.get('/api/categories', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        let categories = await db.collection('categories').find({}).toArray();

        if (categories.length === 0) {
            // Insertar categorías por defecto
            await db.collection('categories').insertMany(DEFAULT_CATEGORIES);
            categories = DEFAULT_CATEGORIES;
        }

        res.json({ categories });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.json({ categories: DEFAULT_CATEGORIES });
    }
});

// POST Category
app.post('/api/categories', async (req, res) => {
    try {
        const { name, icon, color, textColor } = req.body;

        if (!name || !icon) {
            return res.status(400).json({ error: 'Nombre e icono son requeridos' });
        }

        const { db } = await connectToDatabase();

        const id = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const newCategory = {
            id,
            name,
            icon,
            color: color || '#e0e7ff',
            textColor: textColor || '#3730a3',
            isDefault: false
        };

        await db.collection('categories').insertOne(newCategory);
        res.json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});

// ==================== ARTÍCULOS ====================

// GET - Listar todos los artículos
app.get('/api/articles', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const articles = await db.collection('articles')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Formatear para compatibilidad con frontend
        const formattedArticles = articles.map(article => ({
            id: article._id.toString(),
            slug: article.slug || article._id.toString(),
            title: article.title,
            date: article.date,
            category: article.category,
            icon: article.icon || '📄',
            excerpt: article.excerpt,
            tags: article.tags || [],
            filename: `${article.slug || article._id}.html`,
            modifiedTime: new Date(article.updatedAt || article.createdAt).getTime()
        }));

        res.json({ articles: formattedArticles });
    } catch (error) {
        console.error('Error getting articles:', error);
        res.status(500).json({ error: 'Error al obtener artículos', details: error.message });
    }
});

// GET - Obtener un artículo específico
app.get('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { db } = await connectToDatabase();

        let article;

        // Intentar buscar por ObjectId primero
        if (ObjectId.isValid(slug)) {
            article = await db.collection('articles').findOne({ _id: new ObjectId(slug) });
        }

        // Si no se encuentra, buscar por slug
        if (!article) {
            article = await db.collection('articles').findOne({ slug: slug });
        }

        if (!article) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.json({
            id: article._id.toString(),
            slug: article.slug || article._id.toString(),
            title: article.title,
            date: article.date,
            category: article.category,
            excerpt: article.excerpt,
            tags: article.tags || [],
            content: article.content,
            filename: `${article.slug || article._id}.html`
        });
    } catch (error) {
        console.error('Error getting article:', error);
        res.status(500).json({ error: 'Error al obtener artículo' });
    }
});

// Función para generar ID único
function generateObfuscatedId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = 'r-';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// POST - Crear o actualizar artículo
app.post('/api/articles', async (req, res) => {
    try {
        const { title, content, date, category, icon, excerpt, tags, currentSlug } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        const { db } = await connectToDatabase();

        let isUpdate = false;
        let articleId;

        // Verificar si es actualización
        if (currentSlug) {
            let existingArticle;

            if (ObjectId.isValid(currentSlug)) {
                existingArticle = await db.collection('articles').findOne({ _id: new ObjectId(currentSlug) });
            }

            if (!existingArticle) {
                existingArticle = await db.collection('articles').findOne({ slug: currentSlug });
            }

            if (existingArticle) {
                isUpdate = true;
                articleId = existingArticle._id;
            }
        }

        const slug = generateObfuscatedId();
        const now = new Date();

        if (isUpdate) {
            // Actualizar artículo existente
            await db.collection('articles').updateOne(
                { _id: articleId },
                {
                    $set: {
                        title,
                        content,
                        date,
                        category,
                        icon: icon || '📄',
                        excerpt,
                        tags: tags || [],
                        updatedAt: now
                    }
                }
            );

            res.json({
                success: true,
                message: 'Artículo actualizado exitosamente',
                slug: articleId.toString(),
                id: articleId.toString()
            });
        } else {
            // Crear nuevo artículo
            const newArticle = {
                slug,
                title,
                content,
                date,
                category,
                icon: icon || '📄',
                excerpt,
                tags: tags || [],
                createdAt: now,
                updatedAt: now
            };

            const result = await db.collection('articles').insertOne(newArticle);

            res.json({
                success: true,
                message: 'Artículo creado exitosamente',
                slug: slug,
                id: result.insertedId.toString()
            });
        }
    } catch (error) {
        console.error('Error saving article:', error);
        res.status(500).json({ error: 'Error al guardar artículo', details: error.message });
    }
});

// DELETE - Eliminar artículo
app.delete('/api/articles/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { db } = await connectToDatabase();

        let result;

        if (ObjectId.isValid(slug)) {
            result = await db.collection('articles').deleteOne({ _id: new ObjectId(slug) });
        }

        if (!result || result.deletedCount === 0) {
            result = await db.collection('articles').deleteOne({ slug: slug });
        }

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Artículo no encontrado' });
        }

        res.json({ success: true, message: 'Artículo eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Error al eliminar artículo' });
    }
});

// ==================== INICIAR SERVIDOR ====================

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}

// Para Vercel (serverless)
module.exports = app;
