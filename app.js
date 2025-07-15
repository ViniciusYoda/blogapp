import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'; // Mongoose is in use, so keep this import
import admin from './routes/admin.js'; // Your admin routes
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import flash from 'connect-flash';
import moment from 'moment'; // Import moment for date formatting

// Import your Mongoose models directly
import CategoriaModel from './models/Categoria.js'; // Renamed to avoid conflict with 'Categoria' in admin route
import PostagemModel from './models/Postagem.js'; // Renamed to avoid conflict with 'Postagem' in admin route

import usuario from './routes/usuario.js'

// Define __filename and __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session and Flash Middleware
app.use(session({
    secret: 'cursodenode', // Use a more complex secret in production
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    next();
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files middleware
app.use(express.static(path.join(__dirname, "public")));

// Handlebars setup
app.engine('handlebars', engine({
    defaultLayout: 'main',
    // Add Handlebars helpers here
    helpers: {
        formatDate: (date, format) => {
            return moment(date).format(format);
        },
        // Helper for checking equality (useful for selected options in forms)
        eq: (v1, v2) => v1 == v2,
        // Helper to conditionally return a value based on 'erros' presence
        if: (conditional, trueValue, falseValue) => {
            return conditional ? trueValue : falseValue;
        },
        // Combined if and eq for select options
        ifeq: (v1, v2, options) => {
            if (v1 == v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');

// Mongoose Connection
mongoose.Promise = global.Promise; // Set Mongoose to use Node's native promises
mongoose.connect('mongodb://localhost/blogapp').then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
}).catch((err) => {
    console.error(`Erro ao conectar ao MongoDB: ${err}`);
});

// Public Routes
app.get('/', (req, res) => {
    // Use the imported PostagemModel directly
    PostagemModel.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render('index', { postagens: postagens });
    }).catch((err) => {
        console.error("Error fetching recent posts:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar as postagens.");
        res.redirect('/404');
    });
});

app.get('/postagem/:slug', (req, res) => {
    // Corrected typo: Postage to PostagemModel
    PostagemModel.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            // Corrected typo: psotagens/index to postagens/index
            // Corrected variable: postagens to postagem
            res.render("postagens/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Esta postagem não existe.");
            res.redirect('/');
        }
    }).catch((err) => {
        console.error("Error fetching single post by slug:", err);
        req.flash("error_msg", "Houve um erro ao carregar a postagem."); // More generic error
        res.redirect('/');
    });
});

app.get('/404', (req, res) => {
    // Render a 404 view instead of just sending text
    res.status(404).render('404'); // Assuming you have a 404.handlebars view
});

// Categories Public Route (added for completeness, assuming you want to list public categories)
app.get('/categorias', (req, res) => {
    CategoriaModel.find().sort({ nome: 'asc' }).then((categorias) => {
        res.render('categorias/index', { categorias: categorias }); // Assuming you have a categories/index.handlebars view
    }).catch((err) => {
        console.error("Error fetching public categories:", err);
        req.flash("error_msg", "Houve um erro ao listar as categorias.");
        res.redirect('/');
    });
});

app.get('/categorias/:slug', (req, res) => {
    CategoriaModel.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            PostagemModel.find({ categoria: categoria._id }).sort({ data: 'desc' }).then((postagens) => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria }); // Assuming categories/postagens.handlebars
            }).catch((err) => {
                console.error("Error fetching posts for category:", err);
                req.flash("error_msg", "Houve um erro ao listar as postagens desta categoria.");
                res.redirect('/');
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe.");
            res.redirect('/');
        }
    }).catch((err) => {
        console.error("Error finding category by slug:", err);
        req.flash("error_msg", "Houve um erro ao carregar a categoria.");
        res.redirect('/');
    });
});

app.get('/categorias', (req, res) => {
    CategoriaModel.find().then((categoria) => {
        res, render("categorias/index", { categoria: categoria })
    }).catch((err) => {
        console.error("Error finding category by slug:", err);
        req.flash("error_msg", "Houve um erro ao carregar a categoria.");
        res.redirect('/');
    });
})

app.get('/categorias/:slug', (req, res) => {
    CategoriaModel.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            PostagemModel.find({ categoria: categoria._id }).then((postagem) => {
                res.render("categorias/postagem", { postagem: postagem })
            }).catch((err) => {
                console.error("Error finding category by slug:", err);
                req.flash("error_msg", "Houve um erro ao carregar a categoria.");
                res.redirect('/');
            });
        } else {
            req.flash("error_msg", "Essa categoria não existe.");
            res.redirect('/');
        }
    }).catch((err) => {
        console.error("Error finding category by slug:", err);
        req.flash("error_msg", "Houve um erro ao carregar a categoria.");
        res.redirect('/');
    });
})


// Admin Routes
app.use('/admin', admin);
app.use('/usuario', usuario)

const PORT = process.env.PORT || 8081; // Use process.env.PORT for deployment flexibility

// Start the server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});