import { Router } from 'express';
import Categoria from '../models/Categoria.js'; // Assuming these are the exported models
import Postagem from '../models/Postagem.js'; // Assuming these are the exported models
import { eAdmin } from '../helpers/eAdmin.js'; // Assuming eAdmin is correctly exported

const router = Router();

// --- Admin Dashboard ---
router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');
});

// --- Posts Overview (Redirect to main posts list) ---
router.get('/posts', eAdmin, (req, res) => {
    res.redirect('/admin/postagens'); // Redirect to the main postagens list
});

// --- Categories Section ---
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' })
        .then((categorias) => {
            res.render('admin/categorias', { categorias: categorias });
        })
        .catch((err) => {
            console.error("Erro ao listar categorias:", err); // Log the error
            req.flash("error_msg", "Houve um erro ao listar as categorias.");
            res.redirect("/admin");
        });
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

router.post('/categorias/nova', eAdmin, (req, res) => {
    let erros = [];

    if (!req.body.nome || req.body.nome.trim() === '' || req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria inválido ou muito curto." });
    }

    if (!req.body.slug || req.body.slug.trim() === '' || req.body.slug.length < 2) {
        erros.push({ texto: "Slug da categoria inválido ou muito curto." });
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros, nome: req.body.nome, slug: req.body.slug }); // Pass back previous input
    } else {
        const novaCategoria = {
            nome: req.body.nome.trim(), // Trim whitespace
            slug: req.body.slug.trim()
        };

        new Categoria(novaCategoria).save()
            .then(() => {
                req.flash("success_msg", "Categoria cadastrada com sucesso!");
                res.redirect("/admin/categorias");
            })
            .catch((err) => {
                // Check if the error is due to a duplicate slug (from unique: true in schema)
                if (err.code === 11000) { // MongoDB duplicate key error code
                    req.flash("error_msg", "Erro ao cadastrar categoria: Slug já existente. Tente outro.");
                } else {
                    console.error("Erro ao salvar nova categoria:", err); // Log the error
                    req.flash("error_msg", "Erro ao cadastrar categoria. Tente novamente.");
                }
                res.redirect("/admin/categorias");
            });
    }
});

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id })
        .then((categoria) => {
            if (!categoria) {
                req.flash("error_msg", "Categoria não encontrada.");
                return res.redirect("/admin/categorias");
            }
            res.render('admin/editcategorias', { categoria: categoria });
        })
        .catch((err) => {
            console.error("Erro ao buscar categoria para edição:", err);
            req.flash("error_msg", "Categoria inexistente ou erro ao buscar.");
            res.redirect("/admin/categorias");
        });
});

router.post('/categorias/edit', eAdmin, (req, res) => {
    let erros = [];
    if (!req.body.nome || req.body.nome.trim() === '' || req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria inválido ou muito curto." });
    }
    if (!req.body.slug || req.body.slug.trim() === '' || req.body.slug.length < 2) {
        erros.push({ texto: "Slug da categoria inválido ou muito curto." });
    }

    if (erros.length > 0) {
        // Fetch the category again to re-render the form with errors and current data
        Categoria.findOne({ _id: req.body.id })
            .then(categoria => {
                res.render('admin/editcategorias', { erros: erros, categoria: categoria });
            })
            .catch(err => {
                console.error("Erro ao carregar dados da categoria para re-renderizar edição:", err);
                req.flash("error_msg", "Erro ao carregar dados da categoria para edição.");
                res.redirect("/admin/categorias");
            });
    } else {
        Categoria.findOne({ _id: req.body.id })
            .then((categoria) => {
                if (!categoria) {
                    req.flash("error_msg", "Categoria não encontrada para edição.");
                    return res.redirect("/admin/categorias");
                }
                categoria.nome = req.body.nome.trim();
                categoria.slug = req.body.slug.trim();

                categoria.save()
                    .then(() => {
                        req.flash("success_msg", "Categoria editada com sucesso!");
                        res.redirect("/admin/categorias");
                    })
                    .catch((err) => {
                         if (err.code === 11000) { // MongoDB duplicate key error code
                            req.flash("error_msg", "Erro ao editar categoria: Slug já existente. Tente outro.");
                        } else {
                            console.error("Erro ao salvar categoria editada:", err);
                            req.flash("error_msg", "Erro ao editar a categoria.");
                        }
                        res.redirect("/admin/categorias");
                    });
            })
            .catch((err) => {
                console.error("Erro ao buscar categoria para atualização:", err);
                req.flash("error_msg", "Erro ao editar a categoria.");
                res.redirect("/admin/categorias");
            });
    }
});

router.post('/categorias/deletar', eAdmin, (req, res) => {
    // Before deleting a category, consider if there are any posts linked to it.
    // You might want to prevent deletion, or reassign posts to a default category.
    // For now, it will simply delete the category.
    Categoria.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso!");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            console.error("Erro ao deletar categoria:", err);
            req.flash("error_msg", "Erro ao deletar a categoria.");
            res.redirect("/admin/categorias");
        });
});

// --- Posts Section ---
router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({ data: "desc" })
        .then((postagens) => {
            res.render("admin/postagens", { postagens: postagens });
        })
        .catch((err) => {
            console.error("Erro ao renderizar postagens:", err);
            req.flash("error_msg", "Houve um erro para renderizar as postagens.");
            res.redirect("/admin");
        });
});

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find()
        .then((categorias) => {
            res.render("admin/addpostagem", { categorias: categorias });
        })
        .catch((err) => {
            console.error("Erro ao carregar categorias para nova postagem:", err);
            req.flash("error_msg", "Houve um erro ao carregar o formulário de postagem.");
            res.redirect("/admin");
        });
});

router.post("/postagens/novo", eAdmin, (req, res) => {
    let erros = [];

    if (!req.body.titulo || req.body.titulo.trim() === '' || req.body.titulo.length < 3) {
        erros.push({ texto: "Título da postagem inválido ou muito curto." });
    }
    if (!req.body.slug || req.body.slug.trim() === '' || req.body.slug.length < 3) {
        erros.push({ texto: "Slug da postagem inválido ou muito curto." });
    }
    if (!req.body.descricao || req.body.descricao.trim() === '' || req.body.descricao.length < 5) {
        erros.push({ texto: "Descrição da postagem inválida ou muito curta." });
    }
    if (!req.body.conteudo || req.body.conteudo.trim() === '' || req.body.conteudo.length < 10) {
        erros.push({ texto: "Conteúdo da postagem inválido ou muito curto." });
    }
    if (req.body.categoria === "0" || !req.body.categoria) { // Check for empty or "0"
        erros.push({ texto: "Categoria inválida. Selecione uma categoria válida." });
    }

    if (erros.length > 0) {
        Categoria.find()
            .then(categorias => {
                res.render("admin/addpostagem", { 
                    erros: erros, 
                    categorias: categorias,
                    titulo: req.body.titulo, // Pass back previous input
                    slug: req.body.slug,
                    descricao: req.body.descricao,
                    conteudo: req.body.conteudo,
                    categoriaSelecionada: req.body.categoria // Keep selected category
                });
            })
            .catch(err => {
                console.error("Erro ao carregar categorias para o formulário de postagem:", err);
                req.flash("error_msg", "Erro ao carregar categorias para o formulário.");
                res.redirect("/admin/postagens");
            });
    } else {
        const novaPostagem = {
            titulo: req.body.titulo.trim(),
            descricao: req.body.descricao.trim(),
            conteudo: req.body.conteudo.trim(),
            categoria: req.body.categoria,
            slug: req.body.slug.trim()
        };

        new Postagem(novaPostagem).save()
            .then(() => {
                req.flash("success_msg", "Postagem criada com sucesso!");
                res.redirect("/admin/postagens");
            })
            .catch((err) => {
                if (err.code === 11000) { // MongoDB duplicate key error code
                    req.flash("error_msg", "Erro ao cadastrar postagem: Slug já existente. Tente outro.");
                } else {
                    console.error("Erro ao salvar nova postagem:", err);
                    req.flash("error_msg", "Houve um erro ao cadastrar a postagem. Tente novamente.");
                }
                res.redirect("/admin/postagens");
            });
    }
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id })
        .then((postagem) => {
            if (!postagem) {
                req.flash("error_msg", "Postagem não encontrada.");
                return res.redirect("/admin/postagens");
            }
            Categoria.find()
                .then((categorias) => {
                    res.render("admin/editpostagens", { categorias: categorias, postagem: postagem });
                })
                .catch((err) => {
                    console.error("Erro ao listar categorias para edição de postagem:", err);
                    req.flash("error_msg", "Houve um erro ao listar as categorias.");
                    res.redirect("/admin/postagens");
                });
        })
        .catch((err) => {
            console.error("Erro ao buscar postagem para edição:", err);
            req.flash("error_msg", "Houve um erro ao carregar o formulário de edição de postagem.");
            res.redirect("/admin/postagens");
        });
});

router.post("/postagens/edit", eAdmin, (req, res) => {
    let erros = [];
    if (!req.body.titulo || req.body.titulo.trim() === '' || req.body.titulo.length < 3) {
        erros.push({ texto: "Título da postagem inválido ou muito curto." });
    }
    if (!req.body.slug || req.body.slug.trim() === '' || req.body.slug.length < 3) {
        erros.push({ texto: "Slug da postagem inválido ou muito curto." });
    }
    if (!req.body.descricao || req.body.descricao.trim() === '' || req.body.descricao.length < 5) {
        erros.push({ texto: "Descrição da postagem inválida ou muito curta." });
    }
    if (!req.body.conteudo || req.body.conteudo.trim() === '' || req.body.conteudo.length < 10) {
        erros.push({ texto: "Conteúdo da postagem inválido ou muito curto." });
    }
    if (req.body.categoria === "0" || !req.body.categoria) {
        erros.push({ texto: "Categoria inválida. Selecione uma categoria válida." });
    }

    if (erros.length > 0) {
        Postagem.findOne({ _id: req.body.id })
            .then(postagem => {
                Categoria.find()
                    .then(categorias => {
                        res.render("admin/editpostagens", { 
                            erros: erros, 
                            postagem: postagem, 
                            categorias: categorias 
                        });
                    })
                    .catch(err => {
                        console.error("Erro ao carregar categorias para o formulário de edição de postagem:", err);
                        req.flash("error_msg", "Erro ao carregar categorias para o formulário.");
                        res.redirect("/admin/postagens");
                    });
            })
            .catch(err => {
                console.error("Erro ao carregar dados da postagem para re-renderizar edição:", err);
                req.flash("error_msg", "Erro ao carregar dados da postagem para edição.");
                res.redirect("/admin/postagens");
            });
    } else {
        Postagem.findOne({ _id: req.body.id })
            .then((postagem) => {
                if (!postagem) {
                    req.flash("error_msg", "Postagem não encontrada para edição.");
                    return res.redirect("/admin/postagens");
                }
                postagem.titulo = req.body.titulo.trim();
                postagem.slug = req.body.slug.trim();
                postagem.descricao = req.body.descricao.trim();
                postagem.conteudo = req.body.conteudo.trim();
                postagem.categoria = req.body.categoria;

                postagem.save()
                    .then(() => {
                        req.flash("success_msg", "Postagem editada com sucesso!");
                        res.redirect("/admin/postagens");
                    })
                    .catch((err) => {
                        if (err.code === 11000) { // MongoDB duplicate key error code
                            req.flash("error_msg", "Erro ao editar postagem: Slug já existente. Tente outro.");
                        } else {
                            console.error("Erro ao salvar postagem editada:", err);
                            req.flash("error_msg", "Erro ao editar a postagem.");
                        }
                        res.redirect("/admin/postagens");
                    });
            })
            .catch((err) => {
                console.error("Erro ao buscar postagem para atualização:", err);
                req.flash("error_msg", "Houve um erro ao editar a postagem.");
                res.redirect("/admin/postagens");
            });
    }
});

router.post("/postagens/deletar", eAdmin, (req, res) => {
    Postagem.deleteOne({ _id: req.body.id })
        .then(() => {
            req.flash("success_msg", "Postagem deletada com sucesso!");
            res.redirect("/admin/postagens");
        })
        .catch((err) => {
            console.error("Erro ao deletar postagem:", err);
            req.flash("error_msg", "Erro ao deletar a postagem.");
            res.redirect("/admin/postagens");
        });
});

export default router;