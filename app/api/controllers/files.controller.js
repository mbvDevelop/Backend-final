const { PrismaClient } = require('@prisma/client')
const { imageExt } = require('../../utils/fileType.js')
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const prisma = new PrismaClient();

//  Subir un archivo con multipart/form. El archivo tendrá se subira en un parametro de tipo file llamado "file".
const uploadFile = async (req, res) => {
    const file = req.file
    let downloadUrl = ""
    let publicId = ""
    let visualizationURL = ""

    // Tiene que haber un archivo para subir un archivo
    if (file != null) {
        // Crear la entrada del archivo con su nombre y asignarlo al id del usuario
        const fileEntry = await prisma.File.create({
            data: {
                file_name: file.filename,
                owner_id: req.user
            },
        })
        // Comprobar la extension del archivo para determinar si es una imagen o no
        const filenameArray = file.filename.split(".")
        const isImage = imageExt.includes(filenameArray[1])
        try {
            // Subir el archivo a cloudinary
            await cloudinary.uploader.upload(file.path, async (error, result) => {
                publicId = result.public_id
                //Borrar archivo del servidor ya que está en la nube
                fs.unlinkSync(req.file.path)
                // Generar url de descarga para almacenarla en la entrada de la BBDD
                visualizationURL = result.secure_url
                downloadUrl = cloudinary.url(result.public_id, ({ flags: "attachment:" + result.public_id }))
            })
            // Actualizar la base de datos con la id publica (cloudinary) del archivo y la url de descarga. Si es un archivo de imagen, se añadira una url de visualización
            if (isImage) {
                const updated_entry = await prisma.File.update({
                    where: {
                        id: fileEntry.id
                    }, data: {
                        download_url: downloadUrl,
                        public_id: publicId,
                        preview_url: visualizationURL
                    }
                })
                return res.status(200).send(updated_entry)
            }
            const updated_entry = await prisma.File.update({
                where: {
                    id: fileEntry.id
                }, data: {
                    download_url: downloadUrl,
                    public_id: publicId
                }
            })
            return res.status(200).send(updated_entry)
        } catch (error) {
            return res.status(500).send(error)
        }
    }
}

// Borrar un archivo con id proporcionado en el campo "id" del body
const deleteFile = async (req, res) => {
    const fileId = req.body.id
    if (!fileId) {
        return req.status(400).send("File id not imputed")
    }
    // Obtencion de la entrada de la BBDD para acceder al public_id de cloudinary
    const file = await prisma.File.findFirst({
        where: {
            owner: {
                id: req.user
            },
            id: Number(fileId)
        }
    })
    if (!file) {
        return res.status(404).send("not found")
    }
    try {
        // Eliminar el archivo de cloudinary con el public_id
        await cloudinary.uploader.destroy(file.public_id, async (result) => {
            // Eliminar entrada en la base de datos
            await prisma.File.delete({
                where: {
                    id: file.id
                }
            })
            return res.send("file deleted")
        })

    } catch (error) {
        return res.status(500).send("error deleting file")
    }
}

// Buscar archivos con un String en el body llamado "query"
const searchFiles = async (req, res) => {
    const query = req.body.query
    if (!query) {
        return req.status(400).send("Bad Request")
    }
    // Busqueda de archivos en la BBDD
    const results = await prisma.File.findMany({
        where: {
            owner: {
                id: req.user
            },
            file_name: {
                contains: query
            }
        }
    })
    res.send(results)
}

// Listado de todos los archivos asignados al usuario. Se puede paginar usando "page" y asignandole un numero. Tambien se puede modular el numero de archivos por pagina con "items_per_page"
const listAllFiles = async (req, res) => {
    const page = req.body.page // Nº de pagina
    const items_per_page = req.body.items_per_page || 5 // Numero de archivos por pagina
    if (page == null) {
        // Si se hace la llamada sin el campo "page", se devuelven todos los datos sin listar
        const results = await prisma.File.findMany({
            where: {
                owner: {
                    id: req.user
                }
            }
        })
        return res.send(results)
    }
    // Busqueda de datos paginados
    const results = await prisma.File.findMany({
        skip: page * items_per_page,
        take: items_per_page,
        where: {
            owner: {
                id: req.user
            },
        },
    })
    return res.json({ page: page, result: results })
}

module.exports = { uploadFile, searchFiles, listAllFiles, deleteFile }