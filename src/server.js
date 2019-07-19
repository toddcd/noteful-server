const knex = require('knex')
const app = require('./app')
const logger = require('./logger')
const { PORT, DATABASE_URL, NODE_ENV } = require('./config')

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.set('db', db)

app.listen(PORT, () => {

    logger.info(`Server starting in ${NODE_ENV}`)
    logger.info(`Server listening at http://localhost:${PORT}`)

    console.log(`Server listening at http://localhost:${PORT}`)
})