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

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(persons => persons.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
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

    // Check if the added person's name or number is missing 
    if (!name || !number) {
        return response.status(400).json({
            error: 'name or number missing'
        })
    }

    // Check if the added person's name already exists
    if (persons.some(person => person.name === name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const newID = generateRandomId();
    const person = {
        id: newID,
        name,
        number
    }
    persons = persons.concat(person)
    console.log(`Added: ${JSON.stringify(person)}`)
    response.json(person)
})

app.get('/info', (request, response) => {
    const requestTime = new Date().toUTCString()
    const numPersons = persons.length
    const infoContent = `<p>Phonebook has info for ${numPersons} people</p><p>${requestTime}</p>`
    response.send(infoContent)
})

const PORT = process.env.PORT || 3002
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})