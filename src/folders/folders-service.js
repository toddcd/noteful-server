const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    getFolderNotes(knex, id){
        return knex.from('notes').select('*').where('folderid', id)
    },
    getById(knex, id) {
        return knex.from('folders').select('*').where('id', id).first()
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    deleteFolder(knex, id) {
        return knex('folders')
            .where({ id })
            .delete()
    },
    updateFolder(knex, id, newNoteFields) {
        return knex('folders')
            .where({ id })
            .update(newNoteFields)
    },
}

module.exports = FoldersService