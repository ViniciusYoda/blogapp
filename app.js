import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import mongoose from 'mongoose' // Keep commented out if not in use
import admin from './routes/admin.js';
import path from 'path'; // Already imported, but good to keep for clarity
import { fileURLToPath } from 'url'; // Import fileURLToPath from 'url'
import session from 'express-session'
import flash from 'connect-flash'

// Define __filename and __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true
}))

app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files middleware (now __dirname is defined)
app.use(express.static(path.join(__dirname, "public")));

// Handlebars setup
app.engine('handlebars', engine({
  defaultLayout: 'main',
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'handlebars');

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogapp').then(() => {
    console.log('Conectado com sucesso')
}).catch((err) => {
    console.log(`Erro ao conectar ${err}`)
})

// Admin routes
app.use('/admin', admin);

const PORT = 8081;

// Start the server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
