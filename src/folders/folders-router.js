const express = require('express')
const {isWebUri} = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const FoldersService = require('./folders-service')
const { getFolderValidationError } = require('./folder-validator')

const foldersRouter = express.Router()
const bodyParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name),
})

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: note.folderid,
    content: xss(note.content),
})

foldersRouter
    .route('/api/folders')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['name']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send(`'${field}' is required`)
            }
        }

        const {name} = req.body
        const newFolder = {name}

        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                logger.info(`Card with id ${folder.id} created.`)
                res
                    .status(201)
                    .location(`/folder/${folder.id}`)
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/api/folders/:folder_id')
    .all((req, res, next) => {
        const {folder_id} = req.params
        FoldersService.getById(req.app.get('db'), folder_id)
            .then(folder => {
                if (!folder) {
                    logger.error(`Folder with id ${folder_id} not found.`)
                    return res.status(404).json({
                        error: {message: `Folder Not Found`}
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)

    })
    .get((req, res) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const {folder_id} = req.params
        FoldersService.deleteFolder(
            req.app.get('db'),
            id
        )
            .then(numRowsAffected => {
                logger.info(`Folder with id ${folder_id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {

        const {name} = req.body;
        const folderToUpdate = {name}
        const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain either: 'name'`
            })
        }

        const error = getFolderValidationError(folderToUpdate)

        FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            folderToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

foldersRouter
    .route('/api/folders/:folder_id/notes')
    .get((req, res, next) => {
        const {folder_id} = req.params
        FoldersService.getFolderNotes(req.app.get('db'), folder_id)
            .then(folderNotes => {
                res.json(folderNotes.map(serializeNote))
            })
            .catch(next)
    })

module.exports = foldersRouter
