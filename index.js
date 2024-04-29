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

// Logger
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(note => {
        response.json(note)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => response.status(400).send({ error: 'malformatted id' }))
})

function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1
}

const generateRandomId = () => {
    let newId;
    do {
        newId = getRandomInt(100000)
    } while (persons.some(person => person.id === newId))
    return newId
}

app.post('/api/persons', (request, response) => {
    const { name, number } = request.body
    console.log('name:', name);
    console.log('number:', number);

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
        .catch(error => {
            console.error('Error saving the person:', error);
            response.status(500).json({ error: 'failed to save person' })
        })
})

app.get('/info', (request, response) => {
    const requestTime = new Date().toUTCString()
    const numPersons = persons.length
    const infoContent = `<p>Phonebook has info for ${numPersons} people</p><p>${requestTime}</p>`
    response.send(infoContent)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})