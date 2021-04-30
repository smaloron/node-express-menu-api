const express = require('express');
const cors = require('express-cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

let connection;

const connectToDatabase = async () => {
    connection = await mysql.createConnection({
        host: 'localhost', user: 'root', database: 'sql_2021'
    });
}

const getResponse = (response, rows, single = false) => {
    if (rows.length > 0) {
        if (single) rows = rows[0];
        response.status(200).json({ ok: true, data: rows });
    } else {
        response.status(404).json({ok: false, message: 'Aucun résultat'})
    }
}

const app = express();
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/produit', async (request, response) => {
    const data = await connection.execute('SELECT * FROM vue_details_produits');
    getResponse(response, data[0]);
    
});
app.get('/produit/:id', async (request, response) => {
    const data = await connection.execute(
        'SELECT * FROM vue_details_produits WHERE id= ?',
        [request.params.id]
    );
    getResponse(response, data[0], true);   
});

app.post('/produit', async (request, response) => {
    try {
        const sql = 'INSERT INTO produits SET ?';

        productData = {
            nom: request.body.nom,
            prix: request.body.prix || 0,
            description: request.body.descrption || '',
            id_categorie: request.body.id_categorie
        }
        
        const result = await connection.query(sql, productData);
        response.status(200).json(result[0]);

    } catch (err) {
        response.status(500).json({ ok: false, error: err})
    }
    
});

app.get('/categorie', async (request, response) => {
    const data = await connection.execute('SELECT * FROM categories');
    getResponse(response, data[0]);  
});



app.listen(3000, async () => {
    console.log('app started');
    await connectToDatabase();
});
