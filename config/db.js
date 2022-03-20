if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:"mongodb+srv://jeffsf:3l14n312@cluster0.iwm6x.mongodb.net/Cluster0?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI:"mongodb://localhost/blogapp"}
}