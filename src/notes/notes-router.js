const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const NotesService = require('./notes-service')
const { getNoteValidationError } = require('./note-validator')

const notesRouter = express.Router()
const bodyParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    modified: note.modified,
    folderid: note.folderid,
    content: xss(note.content),
})

notesRouter
    .route('/api/notes')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['name', 'folderid', 'content']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send(`'${field}' is required`)
            }
        }

        const {name, folderid, content} = req.body
        const newNote = {name, folderid, content}

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                logger.info(`Note with id ${note.id} created.`)
                res
                    .status(201)
                    .location(`/notes/${note.id}`)
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/api/notes/:note_id')
    .all((req, res, next) => {
        const {note_id} = req.params
        NotesService.getById(req.app.get('db'), note_id)
            .then(note => {
                if (!note) {
                    logger.error(`Note with id ${note_id} not found.`)
                    return res.status(404).json({
                        error: {message: `Note Not Found`}
                    })
                }
                res.note = note
                next()
            })
            .catch(next)

    })
    .get((req, res) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        const {note_id} = req.params
        NotesService.deleteNote(
            req.app.get('db'),
            note_id
        )
            .then(numRowsAffected => {
                logger.info(`Note with id ${note_id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {

        const {name, folderId, content} = req.body;
        const noteToUpdate = {name, folderId, content}
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length

        if (numberOfValues === 0) {
            return res.status(400).json({
                error: `Request body must contain either: 'name', 'foldeId', or 'content'`
            })
        }

        const error = getNoteValidationError(noteToUpdate)

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)

    })

module.exports = notesRouter
