// api.js
const dbOperations = require('./dbOperations');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

// Middleware for logging
router.use((request, response, next) => {
    console.log(`${request.method} request for '${request.url}'`);
    next();
});

// Route to get computer data
router.route('/computers').get((request, response) => {
    dbOperations.getComputer()
        .then(result => {
            response.json(result);
        })
        .catch(error => {
            console.error('Error fetching computer data:', error);
            response.status(500).send('Error fetching computer data');
        });
});

// Route to add or update a computer node
router.route('/computers').post((request, response) => {
    const { name, xcord, ycord } = request.body;
    dbOperations.addOrUpdateComputer(name, xcord, ycord)
        .then(result => {
            response.status(201).send('Computer node added or updated successfully');
        })
        .catch(error => {
            console.error('Error adding or updating computer node:', error);
            response.status(500).send('Error adding or updating computer node');
        });
});

// Route to delete a computer node
router.route('/computers/:name').delete((request, response) => {
    const { name } = request.params;
    dbOperations.removeComputer(name)
        .then(result => {
            response.status(200).send('Computer node deleted successfully');
        })
        .catch(error => {
            console.error('Error deleting computer node:', error);
            response.status(500).send('Error deleting computer node');
        });
});

// Open port to run API from
const port = process.env.PORT || 8090;
app.listen(port, () => {
    console.log(`API is running at port ${port}`);
});
