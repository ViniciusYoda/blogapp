import express from 'express'
import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts/', (req, res) => {
    
})

router.get('/categorias', (req, res) => {
    res.render('admin/categorias')
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})
export default router