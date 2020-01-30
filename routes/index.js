var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/";
let loggedin = false;
let user = {}
let admins = [
  { email: 'niket@gmail.com', password: '1234', name: 'Niket' }
]


// home page route
router.get('/', function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    let dbo = db.db("portfolio");
    dbo.collection('project').find({}).limit(3).toArray(function (err, project) {
      if (err) throw err;

      dbo.collection('blog').find({}).sort({ 'date_created': -1 }).limit(3).toArray(function (err, blog) {
        if (err) throw err;
        db.close();
        res.render('index', { project: project, blog: blog })
      })
    })
  })
});

// subscribe route
router.post('/subscribe', function (req, res) {
  let email = req.body.email;
  console.log(email);
  if (email && email !== '') {
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      let dbo = db.db("portfolio");
      let d = new Date();
      let newsletter = { email, date_created: d };
      dbo.collection('newsletter').insertOne(newsletter, function (err, obj) {
        if (err) throw err;
        // get the projects
        dbo.collection('projects').find({}).limit(3).toArray(function (err, projects) {
          if (err) throw err;
          console.log(JSON.stringify(projects));
          // get the posts
          dbo.collection('posts').find({}).sort({ 'date_created': -1 }).limit(3).toArray(function (err, posts) {
            if (err) throw err;
            console.log(JSON.stringify(posts));
            db.close();
            res.render('index', { projects: projects, posts: posts, success: true })
          })
        })
      })
    });
  }

})

// project page route
router.get('/project', function (req, res) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('project').find({}).toArray(function (err, data) {
      if (err) throw err;
      console.log(JSON.stringify(data));
      db.close();
      res.render('project', { title: 'project', project: data });
    })
  });

});

// project details route
router.get('/project/:id', function (req, res) {
  let id = req.params.id;
  let quantity = 1;
  let page = req.param.page || 1;
  console.log('id --- > ', id);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('project').findOne({ _id: new ObjectId(id) }, function (err, project) {
      if (err) throw err;
      console.log(JSON.stringify(project));
      db.close();
      res.render('projectdetails', { data: project })
    })
  });
})

// blog route
router.get('/blog', function (req, res, next) {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log(err);
    let dbo = db.db("portfolio");
    dbo.collection('blog').find({}).toArray(function (err, data) {
      if (err) throw err;
      console.log(JSON.stringify(data));
      db.close();
      res.render('blog', { title: 'blog', blog: data });
    })
  });
});


// blog details route
router.get('/blog/:id', function (req, res) {
  let id = req.params.id;
  console.log('id --- > ', id);

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('blog').findOne({ _id: new ObjectId(id) }, function (err, project) {
      if (err) throw err;
      console.log(JSON.stringify(project));
      db.close();
      res.render('blogdetails', { data: project })
    })
  });
})

// about route
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'about', layout: 'layout' });
});

// contact route --- get method
router.get('/contact', function (req, res, next) {
  res.render('contact', { title: 'contact', layout: 'layout' });
});

// contact route --- post method
router.post('/contact', [
  check('email').isEmail().withMessage('Please enter a valid email id'),
  check('mobile').isLength({ min: 10 }).withMessage('Mobile  number must be atleast 10 characters')
],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var messages = [];
      errors.errors.forEach(function (err) {
        console.log(JSON.stringify(err))
        messages.push(err.msg)
      })
      let name = req.body.name;
      let mobile = req.body.mobile;
      let email = req.body.email;
      let description = req.body.description;

      res.render('contact', { errors: true, messages: messages, name, mobile, email, description });
    }

    else {
      // read the values and save it in the DB
      let name = req.body.name;
      let mobile = req.body.mobile;
      let email = req.body.email;
      let description = req.body.description;

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        let dbo = db.db("portfolio");
        let d = new Date();
        let contact = { name, mobile, email, message: description };
        dbo.collection('contact').insertOne(contact, function (err, contactObj) {
          if (err) throw err;
          console.log("1 document inserted. Id = " + contactObj._id);
          db.close();
          res.render('contact', { success: true });
        })
      });
    }
  })

// <-------------------- admin section------------------------------------------>
// admin---panel

// router.get('/admin/adminpanel',
//   function (req, res, next) {
//     if (loggedin) {
//       next();
//     }
//     else {
//       res.redirect('/admin');
//     }
//   },
//   function (req, res, next) {
//     res.render('adminpanel', { title: 'admin panel', layout: 'adminpanellayout' })
//   });



// // signin---page
// router.get('/admin', function (req, res, next) {
//   res.render('admin', { title: 'admin', layout: 'adminlayout' })
// });

// router.post('/admin', function (req, res) {
//   let { email, password } = req.body;
//   console.log(email);
//   console.log(password);
//   if (email != undefined && email !== '' && password != undefined && password !== '') {
//     // get the user from DB based on the given details

//     admins.forEach((u) => {
//       console.log(u)
//       if (u.email === email && u.password === password) {
//         user = u;
//         console.log(user);
//       }
//     })

//     if (user && user.name !== undefined) {
//       loggedin = true;
//       res.redirect('/admin/adminpanel')
//     } else {

//       res.render('admin', { title: 'admin', layout: 'adminlayout' })

//     }
//   } else {
//     res.render('admin', { title: 'admin', layout: 'adminlayout' })

//   }
// })


module.exports = router;
