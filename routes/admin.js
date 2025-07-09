import express from 'express'
import { Router } from 'express'
import mongoose from 'mongoose'
import Categoria from '../models/Categoria.js'

const Categorias = mongoose.model("categorias")

const router = Router()

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts/', (req, res) => {

})

router.get('/categorias', (req, res) => {
    Categorias.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) => {

    let erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito curto" })
    }

    if (erros.length > 0) {
        res.render("admin/addCategorias", { erros: erros })
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categorias(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria cadastrado com sucesso")
            res.redirect("/admin/categorias")
        }).catch(((err) => {
            req.flash("error_msg", "Erro ao cadastrar categoria. Tente Novamente")
        }))
    }

})

router.get('/categorias/edit/:id', (req, res) => {
    Categorias.findOne({ _id: req.params.id }).then((categoria) => {

        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Categoria inexistente")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/edit', (req, res) => {
    Categorias.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editado com sucesso")
            res.redirect("admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar a categoria")
            res.redirect("/admin/categorias")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar', (req, res) => {
    Categorias.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar a categoria.");
        res.redirect("/admin/categorias");
    });
});


export default router