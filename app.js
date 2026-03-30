var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

const client = require('prom-client') // Cliente de Prometheus

var indexRouter = require('./src/routes/index')
var usersRouter = require('./src/routes/users')
var itemsRouter = require('./src/routes/items')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de peticiones HTTP procesadas',
    labelNames: ['metodo', 'ruta', 'estado_http']
})

const activeUsersGauge = new client.Gauge({
    name: 'active_users_current',
    help: 'Número actual de usuarios activos simulados'
})

app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestCounter
            .labels(req.method, req.route ? req.route.path : req.path, res.statusCode)
            .inc()
    })
    next()
})

const isTest = process.env.NODE_ENV === 'test'

if (!isTest) {
    client.collectDefaultMetrics()

    setInterval(() => {
        const simulatedUsers = Math.floor(Math.random() * 100)
        activeUsersGauge.set(simulatedUsers)
    }, 5000)
}

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/items', itemsRouter)

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.send(await client.register.metrics())
})

module.exports = app
