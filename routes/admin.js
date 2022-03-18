const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
//const {engine} = require('express-handlebars')
const router = express.Router()
const mongoose = require('mongoose')
const req = require('express/lib/request')
const res = require('express/lib/response')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
const{eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, function(req,res){
    res.render('admin/index')
})

router.get('/posts', eAdmin, function(req,res){
    res.send("Página de posts")
})

router.get('/categorias', eAdmin, function(req,res){
    Categoria.find().then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um erro ao listar as categorias")
        res.redirect('/admin')
    })
})
router.get('/categorias/add', eAdmin, function(req,res){
    res.render('admin/addcategorias')
})
router.post('/categorias/nova', eAdmin, function(req,res){

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        //erros.push(console.log("Erro"))
        erros.push({texto:"Nome Inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido!"})
    }
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno!"})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    } else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(function(){
            req.flash('success_msg',"Categoria criada com Sucesso!")
            res.redirect('../categorias')
        }).catch(function(err){
            req.flash('error_msg',"Houve um erro ao salvar a categoria, tente novamente!")
            console.log("Erro ao salvar categoria!")
        })
    }
})

router.get("/categorias/edit/:id", eAdmin, function(req,res){
    Categoria.findOne({_id:req.params.id}).then (function(categoria) {
        res.render("admin/editcategorias", {categoria:categoria})
    }).catch(function(err){
        req.flash("error_msg","Esta Categoria não Existe");
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/edit", eAdmin, (req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg","Categoria Editada com Sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","Houve um Erro Interno ao Salvar")
        })

    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro ao Editar a Categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", eAdmin, (req,res)=>{

    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg","Categoria Deletada com Sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro ao Deletar o Registro!")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req,res) => {
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens:postagens})
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um Erro ao Carregar as Postagens!")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req,res)=>{
    Categoria.find().then((categorias)=>{

        res.render("admin/addpostagem",{categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro ao Carregar o Formulário")
        res.redirect("/admin")
    })
   
})

router.post("/postagens/nova", eAdmin, (req,res)=>{
    var erros = []

    if(req.body.categoria == '0'){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        res.render("admin/addcategorias",{erros:erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
            
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg","Postagem Criada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            req.flash("error_msg","Houve um Erro ao Salvar a Postagem. Tente Novamente!")
            res.redirect("/admin/postagens")
        })

    }
})

router.get("/postagens/edit/:id", eAdmin, (req,res)=>{
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{

        Categoria.find().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias,postagem:postagem})

        }).catch((err)=>{
            req.flash("error_msg","Houve um Erro ao Lista as Categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro ao Carregar o Fomulário de Edição")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", eAdmin, (req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(()=>{
            req.flash("success_msg","Postagem Editada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg","Erro Interno")
        res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um Erro ao Salvar Edição")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg","Postagem Deletada com Sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro ao Excluir o Registro")
        res.redirect("/admin/postagens")
    })
})

module.exports = router