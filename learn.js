const express  = require('express')
const app = express()
const db = require('./db/db')

app.use(express.json())

app.get('/products', async (req, res) => {
    try {
        // Select operation
        const data = await db.select('*').from('products');

        res.json({
            status: 200,
            data: data
        })
    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

app.get('/products/:id', async (req, res) => {
    try {
        // Select operation
        const data = await db.select('*').from('products').where('id', req.params.id).first();

        if(!data){
            res.json({ status: 404, message: 'Product not found' });
        }

        res.json({
            status: 200,
            data: data
        })
    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

app.post('/products', async (req, res) => {
    try{
        const {name, stock} = req.body

        await db('products').insert({
            name: name,
            stock: stock
        })

        res.status(201).json({status: 201, message: 'product successfully added'})
    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

app.put('/products/:id', async (req, res) => {
    try{
        const {name, stock} = req.body

        await db('products').where('id', req.params.id).update({
            name: name,
            stock: stock
        })

        res.status(201).json({status: 201, message: 'product successfully updated'})
    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

app.delete('/products/:id', async (req, res) => {
    try{
        const id = await db('products').where('id', req.params.id).delete().returning('id')

        res.status(201).json({status: 201, message: 'product successfully deleted'})
    } catch (error) {
        res.json({
            status : 500,
            message: error.message
        });
    }
})

app.listen(4000, () => {
    console.log('listening on port 4000');
})