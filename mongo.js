const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://danielfang7:${password}@fullstackcourse-cluster.tkntrhx.mongodb.net/personApp?retryWrites=true&w=majority&appName=FullStackCourse-Cluster`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    id: 1,
    name: 'Daniel Lee', 
    number: '510-333-1234',
})

const person2 = new Person({
    id: 2,
    name: 'Daniel Chee', 
    number: '510-432-1234',
})

person.save().then(result => {
    console.log('person saved!')
    person2.save().then(result => {
        console.log('person 2 saved!')
    })
})

Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })