import Router from 'express'

const router = Router()

import mongoose from 'mongoose'

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
    }
})

export default router