import express from 'express'
import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
    res.send('Pagina principal')
})

router.get('/posts/', (req, res) => {
    res.send('Post')
})

router.get('/categorias', (req, res) => {
    res.send('Categorias')
})
export default router