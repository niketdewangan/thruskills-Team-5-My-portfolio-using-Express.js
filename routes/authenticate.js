var express = require('express');
var router = express.Router();
// const { check, validationResult } = require('express-validator');
// var MongoClient = require('mongodb').MongoClient;
// var ObjectId = require('mongodb').ObjectID;
// var url = "mongodb://localhost:27017/";
let admins = [
  { email: 'niket.dewangan11@gmail.com', password: 'niket123!@#', name: 'Niket' }
]


// <-------------------- admin section------------------------------------------>

router.get('/', function (req, res) {
  res.render('admin', { title: 'admin', layout: 'adminlayout' })
});

router.post('/', function (req, res) {
  let { email, password } = req.body;
  console.log(email);
  console.log(password);
  if (email != undefined && email !== '' && password != undefined && password !== '') {
    // get the user from DB based on the given details

    admins.forEach((u) => {
      console.log(u)
      if (u.email === email && u.password === password) {
        req.session.isLoggedIn = true;
        req.session.user = u;
        res.redirect('/adminpanel')
      }
     else {
    res.render('admin', { title: 'admin', layout: 'adminlayout' })
     }
  } )
}
});

module.exports = router;