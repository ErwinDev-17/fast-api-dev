var express = require('express')
var router = express.Router()

const client = require('prom-client')

const isTest = process.env.NODE_ENV === 'test'

if (!isTest) {
  client.collectDefaultMetrics()
}

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP procesadas',
  labelNames: ['metodo', 'ruta', 'estado_http']
})

const activeUsersGauge = new client.Gauge({
  name: 'active_users_current',
  help: 'Número actual de usuarios activos simulados'
})

router.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter
      .labels(
        req.method,
        req.route ? req.route.path : req.path,
        res.statusCode
      )
      .inc()
  })
  next()
})

if (!isTest) {
  setInterval(() => {
    const simulatedUsers = Math.floor(Math.random() * 100)
    activeUsersGauge.set(simulatedUsers)
  }, 5000)
}

router.get('/', async function (req, res) {
  res.set('Content-Type', client.register.contentType)
  res.send(await client.register.metrics())
})

module.exports = router