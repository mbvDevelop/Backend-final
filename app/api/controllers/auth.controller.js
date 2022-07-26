const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client')
const statusCode = require('../../utils/httpStatusCode')

const prisma = new PrismaClient();

const register = async (req, res) => {
    const email = req.body.email;
    const name  = req.body.name;
    let password =  req.body.password;

    if (email == null || name == null || password == null) {
        return res.status(400).send(statusCode[400]);
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
        return res.status(400).send(statusCode[400]);
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
            },
        })
        const token = jwt.sign({_id: user.id}, "42");
        res.send(token);
    } catch(err) {
        res.status(400).send(statusCode[400]);
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
    const token = jwt.sign({_id: user.id}, "42");
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
        res.status(200).send(statusCode[200]);
    } catch (error) {
        res.status(500).send(statusCode[500])
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

module.exports = { 
    register,
    login,
    deleteUser,
    getUser,
    updateUser
}
