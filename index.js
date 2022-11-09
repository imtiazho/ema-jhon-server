const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// MiddleWare
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.y0poo9a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        await client.connect();
        const productsCollection = client.db("emaProducts").collection("products");

        // Get all service
        app.get('/products', async (req, res) => {
            console.log('Query', req.query);
            const page = parseInt(req.query.page);
            const pageSize = parseInt(req.query.pageSize);

            const query = {};
            const cursor = productsCollection.find(query);

            let result;
            if(page || pageSize){
                result = await cursor.skip(page*pageSize).limit(pageSize).toArray();
            }
            else{
                result = await cursor.toArray();
            }
            // const result = await cursor.limit(10).toArray();
            res.send(result);
        })


        app.get('/productCount', async (req, res) => {
            // const query = {};
            // const cursor = productsCollection.find(query);
            const count = await productsCollection.estimatedDocumentCount();
            res.send({ count })
        })

        // Add Some Products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        })

        // Use post to get products by ids
        app.post('/productsByKeys', async (req, res) => {
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id))
            const query = {_id: {$in: ids}};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log('JHON server in running')
})