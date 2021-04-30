// Imports de l'application

// Express : framework http permet la création des routes
// intercepte la requête http et envoie une réponse http
const express = require('express');

// CORS : Autorise les requêtes provenant d'autres domaines
// Cross Origin Request Sharing
const cors = require('cors');

// Récupération des données envoyées avec la méthode POST
const bodyParser = require('body-parser');

// Connection au serveur MySQL et exéution des requêtes
const mysql = require('mysql2/promise');

// Une variable qui stocke la connxion à la BD
let connection;

// Une fonction qui établit la connexion
const connectToDatabase = async () => {
    connection = await mysql.createConnection({
        host: 'localhost', user: 'root', database: 'sql_2021'
    });
}

// Une fonction qui gère la réponse http après une requête SQL
// soit on a un résultat alors on envoie ue réponse 200
// soit aucun résultat alors réponse 404
const getResponse = (response, rows, single = false) => {
    if (rows.length > 0) {
        if (single) rows = rows[0];
        response.status(200).json({ ok: true, data: rows });
    } else {
        response.status(404).json({ok: false, message: 'Aucun résultat'})
    }
}

// Création de l'application Express
const app = express();

// Middleware CORS ajoute des infos dans l'en tête http
app.use(cors());

// Middleware qui récupère les données postées
// et les stock dans request.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*************************
 * Définition des routes
 **************************/
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



// Lancement de l'application
app.listen(3000, async () => {
    console.log('app started');
    await connectToDatabase();
});



