var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./src/routes/index')
var usersRouter = require('./src/routes/users')
var itemsRouter = require('./src/routes/items')
var metricsRouter = require('./src/routes/metrics')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/items', itemsRouter)
app.use('/metrics', metricsRouter)

module.exports = app
