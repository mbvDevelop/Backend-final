
// Librerias
const express = require('express');
const app = express();
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;

// Rutas 
const userRoute = require('./app/api/routes/user.routes');
const fileRoute = require('./app/api/routes/files.routes');
const formRoutes = require('./app/api/routes/form.routes')

// Definicion de rutas con los router
app.use('/api/v1/user', userRoute);
app.use('/api/v1/file', fileRoute);
app.use('/api/v1/form', formRoutes);

// Configuracion de cloudinary (Esto deberia estar en el .env pero you know)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

// Funcion para escuchar las llamadas de internet!
app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000')
})


// const session= require('express-session');
// app.use (session({
//      secret: 'secret',
//      resave: true,
//      saveUninitialized:true
// }));
