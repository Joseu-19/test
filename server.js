const express   = require('express'),
dbOperations    = require('./dbfiles/dbOperations'),
cors            = require('cors');


dbOperations.getusers().then(res => {
    console.log(res);
})