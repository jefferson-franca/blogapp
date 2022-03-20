const express = require('express')
//const {engine} = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const res = require('express/lib/response')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require('./routes/usuario')
const passport = require("passport")
const { application } = require('express')
require("./config/auth")(passport)
const db = require("./config/db")
const handlebars = require("express-handlebars")

//Configurações
//Sessão
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
//Middleware
app.use(function(req,res, next){
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next();
})
//Bodyparser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Handlebars
app.engine('handlebars', engine({defaultLayout:'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
        }
    }))
app.set('view engine', 'handlebars');

//Mongoose
mongoose.Promise = global.Promise
mongoose.connect(db.mongoURI).then(function(){
    console.log("Conectado ao mongoDB")
}).catch(function(err){
    console.log("Erro ao se conectar: "+ err)
})

//Rotas
app.get("/", (req,res)=>{
    Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens)=>{
        res.render("index",{postagens:postagens})  
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um Erro ao Carregar a Página")
        res.redirect("/404")
    })
})
app.get("/404",(req,res)=>{
    res.send("Error 404")
})
app.get("/postagem/:slug", (req,res)=>{
    Postagem.findOne({slug: req.params.slug}).then((postagem)=>{
        if(postagem){
            res.render("postagem/index", {postagem:postagem})
        }else{
            req.flash("error_msg","Esta Postagem não Existe!")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro Interno")
        res.redirect("/")
    })
})
app.get("/categorias",(req,res)=>{
    Categoria.find().then((categorias)=>{
        res.render("categorias/index", {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg","Houve um Erro Interno ao Lista as Categorias")
        res.redirect("/")
    })
})
app.get("/categorias/:slug",(req,res)=>{
    Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
        if(categoria){
            Postagem.find({categoria: categoria._id}).then((postagens)=>{
                res.render("categorias/postagens", {postagens:postagens, categoria: categoria})
            }).catch((err)=>{
                console.log(err)
                req.flash("error_msg","Houve um Erro ao Listar os Posts!")
                res.redirect("/")
            })
        }else{
            req.flash("error_msg","Essa Categoria Não Existe")
            res.redirect("/")
        }
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
    })
})
//Public
app.use(express.static(path.join(__dirname,'public')));
//Rotas
app.use('/admin', admin)
app.use('/usuarios', usuarios)

//Outros

const PORT = process.env.PORT || 3000
app.listen(PORT,function(){
    console.log("Servidor rodando na porta 3000... ")
}) 