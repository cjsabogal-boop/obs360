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

// ==================== FUNCIÓN PARA LIMPIAR HTML ====================
function cleanHtmlContent(html) {
    if (!html) return '';

    let content = html;

    // Si tiene estructura HTML completa, extraer solo lo necesario
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
        // Extraer estilos del head
        let styles = '';
        const styleMatches = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
        if (styleMatches) {
            styles = styleMatches.join('\n');
        }

        // Extraer contenido del body
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            content = bodyMatch[1];
        } else {
            // Si no hay body, intentar limpiar tags HTML/HEAD
            content = content
                .replace(/<!DOCTYPE[^>]*>/gi, '')
                .replace(/<html[^>]*>/gi, '')
                .replace(/<\/html>/gi, '')
                .replace(/<head>[\s\S]*?<\/head>/gi, '')
                .replace(/<body[^>]*>/gi, '')
                .replace(/<\/body>/gi, '');
        }

        // Agregar estilos al inicio del contenido
        if (styles) {
            content = styles + '\n' + content;
        }
    }

    // Limpiar cualquier header/footer OBS360 existente
    content = content
        .replace(/<header class="obs-header"[\s\S]*?<\/header>/gi, '')
        .replace(/<footer class="obs-footer"[\s\S]*?<\/footer>/gi, '')
        .replace(/<div style="height: 70px;">\s*<\/div>/gi, '');

    return content.trim();
}

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
        const { title, date, category, icon, excerpt, tags, currentSlug } = req.body;
        let { content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Título y contenido son requeridos' });
        }

        // Ya no limpiamos el HTML - se mostrará en iframe aislado
        // content = cleanHtmlContent(content);

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

// ==================== CLIENTES ====================

// GET - Listar todos los clientes (para admin)
app.get('/api/clients', async (req, res) => {
    try {
        const { db } = await connectToDatabase();
        const clients = await db.collection('clients')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        const formattedClients = clients.map(client => ({
            id: client._id.toString(),
            username: client.username,
            name: client.name,
            company: client.company || '',
            email: client.email || '',
            assignedArticles: client.assignedArticles || [],
            createdAt: client.createdAt,
            lastLogin: client.lastLogin
        }));

        res.json({ clients: formattedClients });
    } catch (error) {
        console.error('Error getting clients:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// GET - Obtener un cliente específico
app.get('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { db } = await connectToDatabase();

        let client;
        if (ObjectId.isValid(id)) {
            client = await db.collection('clients').findOne({ _id: new ObjectId(id) });
        }

        if (!client) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({
            id: client._id.toString(),
            username: client.username,
            name: client.name,
            company: client.company || '',
            email: client.email || '',
            assignedArticles: client.assignedArticles || [],
            createdAt: client.createdAt
        });
    } catch (error) {
        console.error('Error getting client:', error);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// POST - Crear cliente
app.post('/api/clients', async (req, res) => {
    try {
        const { username, password, name, company, email } = req.body;

        if (!username || !password || !name) {
            return res.status(400).json({ error: 'Usuario, contraseña y nombre son requeridos' });
        }

        const { db } = await connectToDatabase();

        // Verificar si el username ya existe
        const existingClient = await db.collection('clients').findOne({ username: username.toLowerCase() });
        if (existingClient) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const newClient = {
            username: username.toLowerCase(),
            password: password, // En producción usar bcrypt
            name,
            company: company || '',
            email: email || '',
            assignedArticles: [],
            createdAt: new Date(),
            lastLogin: null
        };

        const result = await db.collection('clients').insertOne(newClient);

        res.json({
            success: true,
            message: 'Cliente creado exitosamente',
            client: {
                id: result.insertedId.toString(),
                username: newClient.username,
                name: newClient.name,
                company: newClient.company
            }
        });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Error al crear cliente' });
    }
});

// PUT - Actualizar cliente
app.put('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, name, company, email, assignedArticles } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        const { db } = await connectToDatabase();

        const updateData = {
            name,
            company: company || '',
            email: email || '',
            updatedAt: new Date()
        };

        // Solo actualizar username si se proporciona
        if (username) {
            updateData.username = username.toLowerCase();
        }

        // Solo actualizar password si se proporciona
        if (password) {
            updateData.password = password;
        }

        // Actualizar artículos asignados si se proporcionan
        if (assignedArticles !== undefined) {
            updateData.assignedArticles = assignedArticles;
        }

        const result = await db.collection('clients').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

// DELETE - Eliminar cliente
app.delete('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { db } = await connectToDatabase();

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        const result = await db.collection('clients').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
});

// POST - Login de cliente
app.post('/api/auth/client', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const { db } = await connectToDatabase();

        const client = await db.collection('clients').findOne({
            username: username.toLowerCase(),
            password: password
        });

        if (!client) {
            return res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        }

        // Actualizar último login
        await db.collection('clients').updateOne(
            { _id: client._id },
            { $set: { lastLogin: new Date() } }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            client: {
                id: client._id.toString(),
                name: client.name,
                company: client.company,
                assignedArticles: client.assignedArticles || []
            }
        });
    } catch (error) {
        console.error('Error client login:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
});

// GET - Obtener artículos asignados a un cliente
app.get('/api/clients/:id/articles', async (req, res) => {
    try {
        const { id } = req.params;
        const { db } = await connectToDatabase();

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        const client = await db.collection('clients').findOne({ _id: new ObjectId(id) });

        if (!client) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const assignedArticleIds = client.assignedArticles || [];

        if (assignedArticleIds.length === 0) {
            return res.json({ articles: [] });
        }

        // Convertir IDs a ObjectId
        const objectIds = assignedArticleIds
            .filter(id => ObjectId.isValid(id))
            .map(id => new ObjectId(id));

        const articles = await db.collection('articles')
            .find({ _id: { $in: objectIds } })
            .sort({ createdAt: -1 })
            .toArray();

        const formattedArticles = articles.map(article => ({
            id: article._id.toString(),
            slug: article.slug || article._id.toString(),
            title: article.title,
            date: article.date,
            category: article.category,
            icon: article.icon || '📄',
            excerpt: article.excerpt,
            tags: article.tags || [],
            filename: `${article.slug || article._id}.html`
        }));

        res.json({ articles: formattedArticles });
    } catch (error) {
        console.error('Error getting client articles:', error);
        res.status(500).json({ error: 'Error al obtener artículos del cliente' });
    }
});

// POST - Asignar artículos a un cliente
app.post('/api/clients/:id/articles', async (req, res) => {
    try {
        const { id } = req.params;
        const { articleIds } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de cliente inválido' });
        }

        if (!Array.isArray(articleIds)) {
            return res.status(400).json({ error: 'articleIds debe ser un array' });
        }

        const { db } = await connectToDatabase();

        const result = await db.collection('clients').updateOne(
            { _id: new ObjectId(id) },
            { $set: { assignedArticles: articleIds, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.json({ success: true, message: 'Artículos asignados exitosamente' });
    } catch (error) {
        console.error('Error assigning articles:', error);
        res.status(500).json({ error: 'Error al asignar artículos' });
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
