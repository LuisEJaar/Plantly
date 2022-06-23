const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(express.static('public'))
app.use(bodyParser.json())


const flash = require('connect-flash')
const session = require('express-session');

app.use(session({
  secret:'flashblog',
  saveUninitialized: true,
  resave: true
}))

app.use(flash());

const PORT = 3000

app.listen(process.env.PORT || PORT, function() {
    console.log(`listening on http://localhost:${PORT}`)
})

app.use(bodyParser.urlencoded({ extended: true }))

const MongoClient = require('mongodb').MongoClient

let connectionString = "mongodb+srv://luisjaar:mPoDy1DUi6nX54G3@cluster0.se0vt.mongodb.net/?retryWrites=true&w=majority"
let dbname = 'plantly-plants-entries'
let collectionname = 'plants'
let location = '/plants'

MongoClient.connect(connectionString, { useUnifiedTopology: true }) 
.then(client => {
    console.log('Connected to Database')
    const db = client.db(dbname)
    const plantsCollection = db.collection(collectionname)
    let plantsArray
    app.set('view engine', 'ejs')
    app.get('/', (req, res) => {
        db.collection(collectionname).find().toArray()
          .then(results => {
            res.render('index.ejs', { plants: results })
            plantsArray = results
          })
          .catch(error => console.error(error))
    })
    app.post(location, (req, res) => {
        let isUnique = []
        plantsArray.map((object) => {
          isUnique.push(!(req.body.name === object.name))
        })
        if(isUnique.indexOf(false) === -1) {
          plantsCollection.insertOne(req.body)
          .then(result => {
            res.redirect('/')
          })
          .catch(error => console.error(error))
        } else {
            res.redirect('/')
        }
        console.log(isUnique.length)




    })
    app.put(location, (req, res) => {
      plantsCollection.findOneAndUpdate(
        { name: 'Yoda' },
        {
          $set: {
            name: req.body.name,
            quote: req.body.quote
          }
        },
        {
          upsert: true
        }
      )
      .then(result => {
        console.log(result)
       })
      .catch(error => console.error(error))
    })
    app.delete(location, (req, res) => {
      plantsCollection.deleteOne(
        { name: req.body.name }
      )
      .then(result => {
        if (result.deletedCount === 0) {
          return res.json('No plant to delete')
        }
        res.json(`Deleted`)
      })
      .catch(error => console.error(error))
    })
})
.catch(error => console.error(error))
