const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

// Creacion de un formulario de contacto
const sendInquiry = async (req, res) => {
    const title = req.body.title
    const body = req.body.body
    const userId = req.user
    // Comprobar que los campos son validos
    if (!body || !title || !userId) {
        return res.status(400)
    }
    // Crear el registro del formulario en la BBDD
    const form = await prisma.ContactForm.create({
        data: {
            user_id: userId,
            body: body,
            title: title,
        }
    })

    res.send(form)
}

module.exports = { sendInquiry }