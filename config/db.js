if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:"mongodb://jeffsf:iEdeNXLeLN00aj1J.iwm6x.mongodb.net/Cluster0?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI:"mongodb://localhost/blogapp"}
}