require('dotenv').config()
const Person = require('./models/person')

// Express Middleware
const express = require('express')
const app = express()
app.use(express.json())
app.use(express.static('dist'))

// CORS middleware
const cors = require('cors')
app.use(cors())

// Custom token in Morgan to log POST request bodies
const morgan = require('morgan')
morgan.token('postdata', (req, res) => {
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
})

// Morgan setup to use custom token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

// Logger Middleware
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)

// Error Handler Middleware
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => { // Add 'next' parameter
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => next(error)); // Use 'next' for error handling
})

app.get('/api/persons/:id', (request, response, next) => { // Add 'next' parameter
    Person.findById(request.params.id).then(note => {
        response.json(note)
    }).catch(error => next(error)); // Use 'next' for error handling
})

app.delete('/api/persons/:id', (request, response, next) => { // Add 'next' parameter
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error));
})

app.post('/api/persons', (request, response, next) => { // Add 'next' parameter
    const { name, number } = request.body

    // Check if the added person's name or number is missing
    if (!name || !number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    const person = new Person({
        name: name,
        number: number,
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error)); 
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => { // Add 'next' parameter
    Person.countDocuments({}, (err, count) => {
        if (err) {
            next(err); // Pass error to error handler
        } else {
            const requestTime = new Date().toUTCString()
            const infoContent = `<p>Phonebook has info for ${count} people</p><p>${requestTime}</p>`
            response.send(infoContent)
        }
    });
})

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
