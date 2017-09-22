import express from 'express'
import { Nuxt, Builder } from 'nuxt'

import hb from './hb'

const app = express()
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

app.set('port', port)

/*==============================
=            routes            =
==============================*/

// Import API Routes
app.use('/hb', hb)



/*============================
=            nuxt            =
============================*/

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)



/*===============================
=            run app            =
===============================*/

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
