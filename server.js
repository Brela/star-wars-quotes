const express = require('express');
const bodyParser = require('body-parser')// express can't read form data, so we install body-parser to do this
const app = express();
const dotenv = require('dotenv')
const MongoClient = require('mongodb').MongoClient
const serveStatic = require('serve-static');
const mime = require('mime-types');

dotenv.config()


const connectionString = `mongodb+srv://${process.env.DB_username}:${process.env.DB_password}@cluster0.b7emc4r.mongodb.net/?retryWrites=true&w=majority`
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('baby-yoda')
        const quotesCollection = db.collection('quotes')
        app.listen(3000, function () {
            console.log('listening on 3000')
        })
        // Make sure you place body-parser before your CRUD handlers!
        app.use(bodyParser.urlencoded({ extended: true }));

        app.set('view engine', 'ejs')
        // Middlewares and other routes here...
        app.use(bodyParser.json())
        app.use(express.static('public'))

        app.use(express.static('public', {
            setHeaders: function (res, path) {
                if (mime.lookup(path) === 'application/javascript') {
                    res.setHeader('Content-Type', mime.contentType(path));
                }
            }
        }));

        app.get('/', (req, res) => {     // req = request & res = response  
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results })
                })
                .catch(error => console.error(error))
        })
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/') //after form is sent, we are redirecting the browser to home ('/')
                })
                .catch(error => console.error(error))
        })
        app.put('/quotes', (req, res) => {
            console.log('testing app.put')
            quotesCollection.findOneAndUpdate(
                { name: 'yoda' },
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
                .then(result => { console.log(result) })
                .catch(error => console.error(error))
        })


    })
    .catch(error => console.error(error))
