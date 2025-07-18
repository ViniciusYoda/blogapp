import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import flash from 'connect-flash';
import moment from 'moment'; // Make sure moment is installed (npm install moment)

// --- Passport imports and configuration ---
import passport from 'passport'; // Corrected typo: pasport -> passport
import configureAuth from './config/auth.js'; // Renamed to clearly indicate it's a configuration function
configureAuth(passport); // Pass passport to your auth configuration function

// --- Route Imports ---
import adminRoutes from './routes/admin.js'; // Renamed for clarity: admin -> adminRoutes
import userRoutes from './routes/usuario.js'; // Renamed for clarity: usuario -> userRoutes

// --- Mongoose Model Imports ---
import CategoriaModel from './models/Categoria.js';
import PostagemModel from './models/Postagem.js';

// --- ES Module __filename and __dirname setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Session and Flash Middleware ---
app.use(session({
    secret: 'sua_chave_secreta_aqui_para_producao_mais_longa_e_aleatoria', // IMPORTANT: Use a complex, random string in production
    resave: true, // Forces the session to be saved back to the session store, even if the session was never modified
    saveUninitialized: true // Forces a session that is "uninitialized" to be saved to the store.
}));

// --- Passport Middleware ---
app.use(passport.initialize());
app.use(passport.session()); // Corrected typo: initalize -> initialize

// --- Connect-Flash Middleware ---
app.use(flash());

// --- Global variables for flash messages and user (res.locals) ---
// These variables will be available in all your Handlebars templates
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error"); // This 'error' flash is typically set by Passport for authentication failures
    res.locals.user = req.user || null; // Passport attaches the authenticated user to req.user
    next();
});

// --- Body parser middleware ---
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded bodies (for forms)
app.use(bodyParser.json()); // Parses JSON bodies

// --- Static files middleware (for CSS, JS, images) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Handlebars setup ---
app.engine('handlebars', engine({
    defaultLayout: 'main', // Specifies the default layout file
    helpers: {
        // Date formatting helper using Moment.js
        formatDate: (date, format) => {
            return moment(date).format(format);
        },
        // Equality checker helper
        eq: (v1, v2) => v1 == v2,
        // Conditional value helper (less common with #if, but can be useful)
        // Note: Handlebars' built-in #if is usually preferred for control flow
        iff: (conditional, trueValue, falseValue) => { // Renamed to 'iff' to avoid conflict with Handlebars #if
            return conditional ? trueValue : falseValue;
        },
        // Combined if and equality check for select options (e.g., to keep an option selected after error)
        ifeq: (v1, v2, options) => {
            if (String(v1) === String(v2)) { // Added String() conversion for robust comparison (e.g., ObjectId vs string)
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    // Allows access to prototype properties/methods, which can be a security concern if not careful
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars'); // Set Handlebars as the view engine

// --- Mongoose Connection ---
mongoose.Promise = global.Promise; // Mongoose will use Node's native Promise library
mongoose.connect('mongodb://localhost/blogapp', {
    useNewUrlParser: true, // Deprecated, but good to include for older versions/configs
    useUnifiedTopology: true // Recommended for new deployments
}).then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
}).catch((err) => {
    console.error(`Erro ao conectar ao MongoDB: ${err}`);
});

// --- Public Routes ---

// Home Page - List recent posts
app.get('/', (req, res) => {
    PostagemModel.find().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render('index', { postagens: postagens });
    }).catch((err) => {
        console.error("Error fetching recent posts:", err);
        req.flash("error_msg", "Houve um erro interno ao carregar as postagens.");
        res.redirect('/'); // Redirect to home with error, or to a specific error page if preferred
    });
});

// Single Post Page
app.get('/postagem/:slug', (req, res) => {
    PostagemModel.findOne({ slug: req.params.slug }).then((postagem) => {
        if (postagem) {
            res.render("postagens/index", { postagem: postagem });
        } else {
            req.flash("error_msg", "Esta postagem não existe.");
            res.redirect('/');
        }
    }).catch((err) => {
        console.error("Error fetching single post by slug:", err);
        req.flash("error_msg", "Houve um erro ao carregar a postagem.");
        res.redirect('/');
    });
});

// List All Public Categories
app.get('/categorias', (req, res) => {
    CategoriaModel.find().sort({ nome: 'asc' }).then((categorias) => {
        res.render('categorias/index', { categorias: categorias });
    }).catch((err) => {
        console.error("Error fetching public categories:", err);
        req.flash("error_msg", "Houve um erro ao listar as categorias.");
        res.redirect('/');
    });
});

// List Posts by Category Slug
app.get('/categorias/:slug', (req, res) => {
    CategoriaModel.findOne({ slug: req.params.slug }).then((categoria) => {
        if (categoria) {
            PostagemModel.find({ categoria: categoria._id }).sort({ data: 'desc' }).then((postagens) => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria });
            }).catch((err) => {
                console.error("Error fetching posts for category:", err);
                req.flash("error_msg", `Houve um erro ao listar as postagens para a categoria "${categoria.nome}".`);
                res.redirect('/');
            });
        } else {
            req.flash("error_msg", "Esta categoria não existe.");
            res.redirect('/');
        }
    }).catch((err) => {
        console.error("Error finding category by slug for posts list:", err);
        req.flash("error_msg", "Houve um erro ao carregar a categoria.");
        res.redirect('/');
    });
});

// 404 Not Found Page
app.get('/404', (req, res) => {
    res.status(404).render('404'); // Assuming you have a 404.handlebars view
});

// --- Route Groups ---
app.use('/admin', adminRoutes); // Using the renamed import
app.use('/usuarios', userRoutes); // Changed from '/usuario' to '/usuarios' for consistency with login/registro paths

// --- Server Startup ---
const PORT = process.env.PORT || 8081; // Use process.env.PORT for deployment flexibility

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});