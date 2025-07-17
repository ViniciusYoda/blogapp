import Router from 'express'
import mongoose from 'mongoose'
import byscyptjs from 'bcryptjs'
const router = Router()
import passport from 'passport'


import Usuario from '../models/Usuario'

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "senha inválido"})
    }

    if (req.bodyu.senh.length < 4) {
        erros.push({texto: 'Senha muito curto'})
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({texto: 'As senhas não coecide '})
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", {erros: erros})
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario) {
                req.flash("error_msg", "Já existe uma conta com esse email")
                res.redirect('/usuarios/registro')
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro ao salvar usuario")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Sucesso ao criar usuario")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao salvar o usuario")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req. res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

export default router