const express = require('express');
const app  = express();
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config ({path:' ./env'});
const cloudinary = require('cloudinary').v2;

app.listen (3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000')
})

const authRoute = require('./app/api/routes/authRoutes');
app.use('/api/v1/user', authRoute)

cloudinary.config({ 
    cloud_name: 'dv5m9ojtw', 
    api_key: '386183215645272', 
    api_secret: 'E-CZ1rW1wIVRMAX7L9k3-J_qBJo' ,
    secure: true});


// app.use ('/resources', express.static('public'));
// app.use ('/resources', express.static(__dirname +'/public'));

// app.set('view engine', 'ejs');

// // Rutas
// app.get ('/' , (req, res) =>{
//     res.render('index')
// })
// app.get ('/login' , (req, res) =>{
//     res.render('login')
// })
// app.get ('/register' , (req, res) =>{
//     res.render('register')
// })

// const session= require('express-session');
// app.use (session({
//      secret: 'secret',
//      resave: true,
//      saveUninitialized:true
// }));
