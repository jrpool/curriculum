require('./environment')
require('pg').defaults.ssl
  = ['staging', 'production'].includes(process.env.NODE_ENV)
const environments = 'development test staging production'.split(' ')
const config = {}

environments.forEach(env => {
  config[env] = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/database/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: __dirname + `/database/seeds/${env}`
    }
  }
})

module.exports = config
