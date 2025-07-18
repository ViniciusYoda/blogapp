import { Router } from 'express'; // Import Router directly from express
import bcrypt from 'bcryptjs'; // Corrected import name for bcryptjs
import passport from 'passport';

import Usuario from '../models/Usuario.js'; // Ensure correct path and .js extension if using ES modules

const router = Router();

// --- Registration Routes ---
router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
    let erros = [];

    // Basic validation for name
    if (!req.body.nome || req.body.nome.trim() === '' || req.body.nome.length < 3) {
        erros.push({ texto: "Nome inválido ou muito curto." });
    }

    // Basic validation for email
    if (!req.body.email || req.body.email.trim() === '' || !req.body.email.includes('@')) {
        erros.push({ texto: "Email inválido." });
    }

    // Basic validation for password
    if (!req.body.senha || req.body.senha.trim() === '') {
        erros.push({ texto: "Senha inválida." });
    } else if (req.body.senha.length < 4) { // Minimum password length check
        erros.push({ texto: "Senha muito curta. Mínimo de 4 caracteres." });
    }

    // Check if passwords match
    if (req.body.senha !== req.body.senha2) { // Corrected typo 'req.bodyu.senh' and message
        erros.push({ texto: 'As senhas não coincidem. Tente novamente.' });
    }

    if (erros.length > 0) {
        // Re-render the registration form with errors and previous input
        res.render("usuarios/registro", { 
            erros: erros,
            nome: req.body.nome,
            email: req.body.email 
        });
    } else {
        // Check if a user with this email already exists
        Usuario.findOne({ email: req.body.email.trim() })
            .then((usuario) => {
                if (usuario) {
                    req.flash("error_msg", "Já existe uma conta com este email.");
                    res.redirect('/usuarios/registro');
                } else {
                    const novoUsuario = new Usuario({
                        nome: req.body.nome.trim(),
                        email: req.body.email.trim(),
                        // Password will be hashed below, no need to trim here
                        senha: req.body.senha 
                    });

                    // Hash the password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                            if (err) {
                                console.error("Erro ao gerar hash da senha:", err);
                                req.flash("error_msg", "Houve um erro ao processar seu registro.");
                                return res.redirect("/");
                            }
                            novoUsuario.senha = hash;

                            // Save the new user to the database
                            novoUsuario.save()
                                .then(() => {
                                    req.flash("success_msg", "Usuário registrado com sucesso!");
                                    res.redirect("/");
                                })
                                .catch((err) => {
                                    console.error("Erro ao salvar novo usuário:", err);
                                    req.flash("error_msg", "Houve um erro ao salvar o usuário. Tente novamente.");
                                    res.redirect("/usuarios/registro");
                                });
                        });
                    });
                }
            })
            .catch((err) => {
                console.error("Erro ao buscar usuário por email:", err);
                req.flash("error_msg", "Houve um erro interno ao verificar o email.");
                res.redirect("/");
            });
    }
});

// --- Login Routes ---
router.get("/login", (req, res) => {
    res.render("usuarios/login");
});

router.post("/login", (req, res, next) => { // Corrected typo 'req. res, next'
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next);
});

// --- Logout Route ---
router.get("/logout", (req, res, next) => {
    // Passport.js logout method.
    // In newer versions of Passport, req.logout() might require a callback
    // or return a Promise. For simplicity and common usage:
    req.logout((err) => {
        if (err) { 
            console.error("Erro ao fazer logout:", err);
            return next(err); 
        }
        req.flash("success_msg", "Logout realizado com sucesso!");
        res.redirect("/");
    });
});

export default router;