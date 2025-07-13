import { Router } from 'express'; // Only import Router, not express again
import mongoose from 'mongoose';
import Categoria from '../models/Categoria.js'; // Assuming these are the exported models
import Postagem from '../models/Postagem.js'; // Assuming these are the exported models

// You no longer need these lines if you're importing the models directly
// const Categorias = mongoose.model("categorias")
// const Postagens = mongoose.model("postagens")

const router = Router();

router.get('/', (req, res) => {
    res.render('admin/index');
});

router.get('/posts', (req, res) => {
    // This route was empty, consider adding functionality here if needed,
    // otherwise, the /postagens route below covers listing.
    res.redirect('/admin/postagens'); // Example: redirect to list all posts
});

router.get('/categorias', (req, res) => {
    // Use the imported model 'Categoria' directly
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias });
    }).catch((err) => {
        console.error("Error listing categories:", err); // Log the error for debugging
        req.flash("error_msg", "Houve um erro ao listar as categorias.");
        res.redirect("/admin");
    });
});

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', (req, res) => {
    let erros = [];

    if (!req.body.nome || typeof req.body.nome === 'undefined' || req.body.nome === null) {
        erros.push({ texto: "Nome inválido." });
    }

    if (!req.body.slug || typeof req.body.slug === 'undefined' || req.body.slug === null) {
        erros.push({ texto: "Slug inválido." });
    }

    if (req.body.nome && req.body.nome.length < 2) { // Added a check for req.body.nome existence
        erros.push({ texto: "Nome da categoria muito curto." });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros }); // Corrected path/variable name
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        };

        // Use the imported model 'Categoria' directly
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria cadastrada com sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            console.error("Error saving new category:", err); // Log the error
            req.flash("error_msg", "Erro ao cadastrar categoria. Tente novamente.");
            res.redirect("/admin/categorias"); // Redirect to the category list on error
        });
    }
});

router.get('/categorias/edit/:id', (req, res) => {
    // Use the imported model 'Categoria' directly
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        if (!categoria) { // Handle case where category is not found
            req.flash("error_msg", "Categoria não encontrada.");
            return res.redirect("/admin/categorias");
        }
        res.render('admin/editcategorias', { categoria: categoria });
    }).catch((err) => {
        console.error("Error finding category for edit:", err); // Log the error
        req.flash("error_msg", "Categoria inexistente ou erro ao buscar.");
        res.redirect("/admin/categorias");
    });
});

router.post('/categorias/edit', (req, res) => {
    // Basic validation for name and slug before updating
    let erros = [];
    if (!req.body.nome || req.body.nome.length < 2) {
        erros.push({ texto: "Nome inválido ou muito curto." });
    }
    if (!req.body.slug) {
        erros.push({ texto: "Slug inválido." });
    }

    if (erros.length > 0) {
        // Fetch the category again to re-render the form with errors and current data
        Categoria.findOne({ _id: req.body.id }).then(categoria => {
            res.render('admin/editcategorias', { erros: erros, categoria: categoria });
        }).catch(err => {
            req.flash("error_msg", "Erro ao carregar dados da categoria para edição.");
            res.redirect("/admin/categorias");
        });
    } else {
        // Use the imported model 'Categoria' directly
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            if (!categoria) { // Handle case where category is not found during update
                req.flash("error_msg", "Categoria não encontrada para edição.");
                return res.redirect("/admin/categorias");
            }
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!");
                res.redirect("/admin/categorias"); // Corrected redirect path
            }).catch((err) => {
                console.error("Error saving edited category:", err); // Log the error
                req.flash("error_msg", "Erro ao editar a categoria.");
                res.redirect("/admin/categorias");
            });
        }).catch((err) => {
            console.error("Error finding category for update:", err); // Log the error
            req.flash("error_msg", "Erro ao editar a categoria.");
            res.redirect("/admin/categorias");
        });
    }
});

router.post('/categorias/deletar', (req, res) => {
    // Use the imported model 'Categoria' directly
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!");
        res.redirect("/admin/categorias");
    }).catch((err) => {
        console.error("Error deleting category:", err); // Log the error
        req.flash("error_msg", "Erro ao deletar a categoria.");
        res.redirect("/admin/categorias");
    });
});

router.get("/postagens", (req, res) => {
    // Use the imported model 'Postagem' directly
    Postagem.find().populate("categoria").sort({ data: "desc" }).then((postagens) => { // Corrected variable name 'postagem' to 'postagens'
        res.render("admin/postagens", { postagens: postagens });
    }).catch((err) => { // Corrected variable name 'errr' to 'err'
        console.error("Error rendering posts:", err); // Log the error
        req.flash("error_msg", "Houve um erro para renderizar as postagens."); // Changed "rederizar" to "renderizar" and "postagem" to "postagens"
        res.redirect("/admin");
    });
});

router.get("/postagens/add", (req, res) => {
    // Use the imported model 'Categoria' directly
    Categoria.find().then((categorias) => {
        res.render("admin/addpostagem", { categorias: categorias });
    }).catch((err) => {
        console.error("Error finding categories for new post:", err); // Log the error
        req.flash("error_msg", "Houve um erro ao carregar o formulário de postagem.");
        res.redirect("/admin");
    });
});

router.post("/postagens/novo", (req, res) => {
    let erros = [];

    // Added basic validation for post fields
    if (!req.body.titulo || req.body.titulo.length < 3) {
        erros.push({ texto: "Título inválido ou muito curto." });
    }
    if (!req.body.slug || req.body.slug.length < 3) {
        erros.push({ texto: "Slug inválido ou muito curto." });
    }
    if (!req.body.descricao || req.body.descricao.length < 5) {
        erros.push({ texto: "Descrição inválida ou muito curta." });
    }
    if (!req.body.conteudo || req.body.conteudo.length < 10) {
        erros.push({ texto: "Conteúdo inválido ou muito curto." });
    }

    if (req.body.categoria === "0") { // Corrected "pish" to "push" and added more descriptive message
        erros.push({ texto: "Categoria inválida. Selecione uma categoria válida." });
    }

    if (erros.length > 0) {
        // Fetch categories again to re-render the addpostagem form with errors
        Categoria.find().then(categorias => {
            res.render("admin/addpostagem", { erros: erros, categorias: categorias });
        }).catch(err => {
            req.flash("error_msg", "Erro ao carregar categorias para o formulário.");
            res.redirect("/admin/postagens");
        });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        };

        // Use the imported model 'Postagem' directly
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!"); // Changed "criado" to "criada" for gender agreement
            res.redirect("/admin/postagens");
        }).catch((err) => {
            console.error("Error saving new post:", err); // Log the error
            req.flash("error_msg", "Houve um erro ao cadastrar a postagem. Tente novamente.");
            res.redirect("/admin/postagens");
        });
    }
});

router.get("/postagens/edit/:id", (req, res) => {
    // Use the imported model 'Postagem' directly
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        if (!postagem) { // Handle case where post is not found
            req.flash("error_msg", "Postagem não encontrada.");
            return res.redirect("/admin/postagens");
        }
        // Use the imported model 'Categoria' directly
        Categoria.find().then((categorias) => { // Corrected variable name 'categoria' to 'categorias' for consistency
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem }); // Corrected 'res, render' to 'res.render'
        }).catch((err) => {
            console.error("Error listing categories for post edit:", err); // Log the error
            req.flash("error_msg", "Houve um erro ao listar as categorias.");
            res.redirect("/admin/postagens");
        });
    }).catch((err) => {
        console.error("Error finding post for edit:", err); // Log the error
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição de postagem."); // Corrected 'req.flashh' to 'req.flash'
        res.redirect("/admin/postagens");
    });
});

router.post("/postagem/edit", (req, res) => { // Path should be '/postagens/edit' for consistency
    // Basic validation for post fields before updating
    let erros = [];
    if (!req.body.titulo || req.body.titulo.length < 3) {
        erros.push({ texto: "Título inválido ou muito curto." });
    }
    if (!req.body.slug || req.body.slug.length < 3) {
        erros.push({ texto: "Slug inválido ou muito curto." });
    }
    if (!req.body.descricao || req.body.descricao.length < 5) {
        erros.push({ texto: "Descrição inválida ou muito curta." });
    }
    if (!req.body.conteudo || req.body.conteudo.length < 10) {
        erros.push({ texto: "Conteúdo inválido ou muito curto." });
    }
    if (req.body.categoria === "0") {
        erros.push({ texto: "Categoria inválida. Selecione uma categoria válida." });
    }

    if (erros.length > 0) {
        Postagem.findOne({ _id: req.body.id }).then(postagem => {
            Categoria.find().then(categorias => {
                res.render("admin/editpostagens", { erros: erros, postagem: postagem, categorias: categorias });
            }).catch(err => {
                req.flash("error_msg", "Erro ao carregar categorias para o formulário.");
                res.redirect("/admin/postagens");
            });
        }).catch(err => {
            req.flash("error_msg", "Erro ao carregar dados da postagem para edição.");
            res.redirect("/admin/postagens");
        });
    } else {
        // Use the imported model 'Postagem' directly
        Postagem.findOne({ _id: req.body.id }).then((postagem) => {
            if (!postagem) { // Handle case where post is not found during update
                req.flash("error_msg", "Postagem não encontrada para edição.");
                return res.redirect("/admin/postagens");
            }
            postagem.titulo = req.body.titulo; // Corrected 'tiulo' to 'titulo'
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!"); // Corrected 'succcess_msg' to 'success_msg'
                res.redirect("/admin/postagens"); // Corrected redirect path to plural 'postagens'
            }).catch((err) => {
                console.error("Error saving edited post:", err); // Log the error
                req.flash("error_msg", "Erro ao editar a postagem.");
                res.redirect("/admin/postagens"); // Corrected redirect path to plural 'postagens'
            });
        }).catch((err) => {
            console.error("Error finding post for update:", err); // Log the error
            req.flash("error_msg", "Houve um erro ao editar a postagem.");
            res.redirect("/admin/postagens");
        });
    }
});

// Changed to POST and removed :id from path if deleting via form body ID
router.post("/postagens/deletar", (req, res) => {
    // Use the imported model 'Postagem' directly
    Postagem.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        console.error("Error deleting post:", err); // Log the error
        req.flash("error_msg", "Erro ao deletar a postagem.");
        res.redirect("/admin/postagens");
    });
});


export default router;