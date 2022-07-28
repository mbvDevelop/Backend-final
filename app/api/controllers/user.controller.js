const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


const prisma = new PrismaClient();
// Crea un nuevo usuario y devuelve un token de acceso en caso de funcionar
// Se ha de usar multipart/form para esta peticion. La foto se subira en un 
// campo "file" del formulario. 
const register = async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    let password = req.body.password;
    let photo_url = ""

    // Comprobar que los campos necesarios existen
    if (email == null || name == null || password == null) {
        return res.status(400).send("fill the fields");
    }

    // Comprobar que no existan usuarios con el mismo correo
    const emailExists = await prisma.User.findUnique({
        where: {
            email: email,
        },
    })

    // Comprobar que no existan usuarios con el mismo correo
    const nameExists = await prisma.User.findFirst({
        where: {
            name: name,
        },
    })

    if (emailExists || nameExists) {
        return res.status(400).send("username or email in use");
    }
    // Si se sube una foto de perfil, almacenarla en cloudinary
    if (req.file != null) {
        try {
            await cloudinary.uploader.upload(req.file.path, async (error, result) => {
                photo_url = result.secure_url // Guardar la url de la imagen para poder mostrarla en el front
                fs.unlinkSync(req.file.path) // Eliminar el archivo temporal del directorio del servidor
            })
        } catch (error) {
            req.send(error)
        }
    }
    // Hash de la contraseña para nunca almacenar contraseñas en texto en la BBDD
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    password = null // limpiando las variables

    //Crear la entrada del usuario con todos los datos
    try {
        const user = await prisma.User.create({
            data: {
                email: email,
                name: name,
                password: hashedPass,
                photo_url: photo_url
            },
        })
        // Generar un access token con el id del usuario
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SALT);
        res.send(token);
    } catch (err) {
        res.status(500).send(statusCode[500]);
    }
};

// Log in
const login = async (req, res) => {
    // Buscar el usuario por correo en la base de datos
    const user = await prisma.User.findUnique({
        where: {
            email: req.body.email,
        },
    })
    // Si existe comprobar contraseñas con bcrypt
    if (!user) return res.status(400).send(statusCode[400]);
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send(statusCode[400]);
    // Generar token de acceso con el id del usuario
    const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SALT);
    // Enviar el token de acceso
    res.send(token)
}

// LLamada para obtener información del usuario ya logueado
const getUser = async (req, res) => {
    try {
        // Buscar el usuario por el id del token de acceso
        const user = await prisma.User.findUnique({
            where: {
                id: req.user,
            },
        })
        console.log(req.user)
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send("user not found for id: " + req.user)
    }
}

// Eliminar el usuario ya logueado
const deleteUser = async (req, res) => {
    try {
        // Eliminacion de la entrada en la BBDD
        const user = await prisma.User.delete({
            where: {
                id: req.user,
            },
        })
        res.status(200).send(statusCode[200])
    } catch (error) {
        res.status(404).send(statusCode[404])
    }
}

// Cambiar el nombre del usuario
const updateUserName = async (req, res) => {
    // Actualizar el nombre del usuario en la base de datos
    try {
        const updatedUser = await prisma.User.update({
            where: {
                id: req.user
            },
            data: {
                name: req.body.name,
            }
        })
        res.status(201).send(updatedUser)
    } catch (error) {
        res.status(500).send(statusCode[500])
    }
}

// Actualizar la imagen de perfil del usuario. Se debe usar multipart/form
// y la foto deberá ir en el campo "file"
const updatePicture = async (req, res) => {
    if (req.file == null) {
        res.status(500).send("File not uploaded")
    }
    try {
        // Subir el archivo de la imagen a cloudinary
        await cloudinary.uploader.upload(req.file.path, async (error, result) => {
            // Actualizar la entrada del usuario con la nueva url de la foto
            const updatedUser = await prisma.User.update({
                where: {
                    id: req.user
                },
                data: {
                    photo_url: result.secure_url
                }
            });
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) {
                res.status(500).send(error)
            }
            res.status(200).send(updatedUser)
        });
    } catch (error) {
        res.status(500).send(statusCode[500])
    }

}

module.exports = {
    register,
    login,
    deleteUser,
    getUser,
    updateUser: updateUserName,
    updatePicture
}
