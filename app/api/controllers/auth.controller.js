const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client')
const statusCode = require('../../utils/httpStatusCode');
const httpStatusCode = require('../../utils/httpStatusCode');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


const prisma = new PrismaClient();

const register = async (req, res) => {
    const email = req.body.email;
    const name  = req.body.name;
    let password =  req.body.password;
    let photo_url = ""
    
    if (email == null || name == null || password == null) {
        return res.status(400).send("fill the fields");
    }

    const emailExists = await prisma.User.findUnique({
        where: {
          email: email,
        },
      })

    const nameExists = await prisma.User.findFirst({
        where: {
          name: name, 
        },
      })

    if (emailExists || nameExists) {
        return res.status(400).send("username or email in use");
    }
   
    if (req.file != null) {
        try {
            await cloudinary.uploader.upload(req.file.path, async (error, result) => {
                    photo_url = result.secure_url
                    fs.unlinkSync(req.file.path)
            })
        } catch (error) {
            req.send(error)
        }
    }
    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(password, salt);
    password = null

    //Create user
    try {
        const user = await prisma.User.create({
            data: {
                email: email,
                name: name,
                password: hashedPass,
                photo_url: photo_url
            },
        })
        const token = jwt.sign({_id: user.id}, "123");
        res.send(token);
    } catch(err) {
        res.status(500).send(statusCode[500]);
    }
};

const login = async (req, res) => {
    const user = await prisma.User.findUnique({
        where: {
          email: req.body.email,
        },
      })
    if (!user) return res.status(400).send(statusCode[400]);
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send(statusCode[400]);
    // Gen token
    const token = jwt.sign({_id: user.id}, "123");
    // Send the auth token
    res.send(token)
}

const deleteUser = async (req, res) => {
    try {
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

const getUser = async (req, res) => {
    try {
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

const updateUser = async (req, res) => {
    try {
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = null
        const updateUser = await prisma.User.update({
            where: {
                id: req.user
            },
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPass
            }
        })
        res.status(201).send(statusCode[201])
    } catch (error) {
        res.status(500).send(statusCode[500])
    }
}

const updatePicture = async (req, res) => {
    console.log(req.body.test)
    try {
        await cloudinary.uploader.upload(req.file.path, async (error, result) => {
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
        res.status(500).send(httpStatusCode[500])
    }
    
}

module.exports = { 
    register,
    login,
    deleteUser,
    getUser,
    updateUser,
    updatePicture
}
