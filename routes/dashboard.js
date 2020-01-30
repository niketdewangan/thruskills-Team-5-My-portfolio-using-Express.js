var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/";

  // var loggedIn = req.session.isLoggedIn;


// admin---panel
// router.get('/adminpanel',function (req, res, next) {
//     res.render('adminpanel', { title: 'admin panel', layout: 'adminpanellayout' })
//   });

let authenticate = function (req, res, next) {
    var loggedin = req.session.isLoggedIn;
    if (loggedin) {
      next();
    }
    else {
      res.redirect('/admin');
    }
  };


  let authenticated = function(req,res,next){
    req.session.isLoggedIn = req.session.isLoggedIn ? true:false;
     console.log('authenticated',req.session)
    if(req.session.isLoggedIn){
        res.locals.user = req.session.user;
        next();
    } else{
        next();
    }
  }

  router.use(authenticated);
 router.use(authenticate);
  


// <-------------------- admin section------------------------------------------>
// admin---panel
router.get('/',function (req, res, next) {
    // MongoClient.connect(url,function(err,db){
    //   let cproject = null; let cblog =null; let cletter =null;let ccontact=null;
      
     
    //   if(err) throw err;
    //   let dbo = db.db("portfolio");
    //   dbo.collection('project').count(function(err, countproject){
    //     if(err) throw err;
    //     console.log(JSON.stringify(countproject));
    //   })
    //   dbo.collection('blog').count(function(err, countblog){
    //     if(err) throw err;
    //     console.log(JSON.stringify(countblog));
    //   })
    //   dbo.collection('newsletter').count(function(err, countletter){
    //     if(err) throw err;
    //     console.log(JSON.stringify(countletter));
    //   })
    //   dbo.collection('contact').count(function(err, countcontact){
    //     if(err) throw err;
    //     console.log(JSON.stringify(countcontact));
    //   })
    // })


  // --------------------------- admin panel --------------------------------------

    res.render('adminpanel', { title: 'admin panel', layout: 'adminpanellayout' })
  });



  // ---------------------------- project list --------------------------------

  router.get('/projects',function(req,res,next){
    MongoClient.connect(url, function(err,db){
      if (err) throw err;
      let dbo = db.db("portfolio");
      dbo.collection('project').find().toArray(function(err,plist){
        if (err) throw err
        db.close();
        // console.log(JSON.stringify(plist));
        res.render('projects/list', {layout: 'listlayout', plist: plist})
      })
    })
  })


  // ---------------------------project details & update--------------------------------------

  router.get('/projects/:id',  function(req, res, next) {
    // read the id from the path param
    let id = req.params.id;
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      let dbo = db.db("portfolio");
      dbo.collection('project').findOne({_id: new ObjectId(id)}, function(err, project){
        if (err) throw err;
        console.log(JSON.stringify(project));
        db.close();
        res.render('projects/projectdetails', { project : project , layout:'adminpanellayout'})
      })
    });
  });
  
  
  router.post('/projects/:id',  function(req, res, next) {
    let id = req.params.id;
  
    let title = req.body.title;
    let image = req.body.img_1;
    let description = req.body.desc;
    let project = {title, image, description};
    let updatedProject = {$set: project};
  
    MongoClient.connect(url, function(err, db){
      if (err) throw err;
      let dbo = db.db("portfolio");
      dbo.collection('project').updateOne({_id: new ObjectId(id)}, updatedProject, function(err, p){
        if (err) throw err;
        console.log(JSON.stringify(p));
        db.close();
        res.render('projects/projectDetails', { project : project , layout: 'adminpanellayout', success: true})
      })
    });
  
  });
  
  
  // ---------------------------create new project--------------------------------------

  router.get('/newproject',  function(req, res, next) {
    res.render('projects/newproject', {layout: 'adminpanellayout', 'title': 'Create new project'})
  });
  
  /* Submit create project */
router.post('/newproject',  function(req, res, next) {
  let title = req.body.title;
  let img_1 = req.body.image;
  let desc = req.body.description;
  let project = {title, img_1, desc};
  
  // write it to the db
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    // get the projects
    dbo.collection('project').insertOne(project, function(err, project){
        if (err) throw err;
        console.log(JSON.stringify(project));
        db.close();
        // redirect to list of projects page
        res.redirect('/adminpanel/projects')
    })
  });
});

router.get('/projects/:id/delete',  function(req, res, next) {
  let id = req.params.id;
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('project').deleteOne({_id: new ObjectId(id)}, function(err, p){
      if (err) throw err;
      console.log(JSON.stringify(p));
      db.close();
      res.redirect('/adminpanel/projects')
    })
  });
});







// ---------------------------- Blog list --------------------------------

router.get('/blog',function(req,res,next){
  MongoClient.connect(url, function(err,db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('blog').find().toArray(function(err,blist){
      if (err) throw err
      db.close();
      res.render('blog/blist', {layout: 'listlayout', blist: blist})
    })
  })
})


// ---------------------------Blog details & update--------------------------------------

router.get('/blog/:id',  function(req, res, next) {
  
  let id = req.params.id;
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('blog').findOne({_id: new ObjectId(id)}, function(err, blog){
      if (err) throw err;
      console.log(JSON.stringify(blog));
      db.close();
      res.render('blog/blogdetails', { blog : blog , layout:'adminpanellayout'})
    })
  });
});


router.post('/blog/:id',  function(req, res, next) {
  let id = req.params.id;
  let title = req.body.title;
  let img = req.body.img;
  let blog = req.body.desc;
  let blogd = {title, img, blog};
  let updatedblog = {$set: blogd};

  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('blog').updateOne({_id: new ObjectId(id)}, updatedblog, function(err, blogd){
      if (err) throw err;
      console.log(JSON.stringify(blogd));
      db.close();
      res.render('blog/blogdetails', { blogd : blogd , layout: 'adminpanellayout', success: true})
    })
  });
});


// --------------------------- new blog--------------------------------------

router.get('/newblog',  function(req, res, next) {
  res.render('blog/newblog', {layout: 'adminpanellayout', 'title': 'Create new project'})
});

/* Submit create project */
router.post('/newblog',  function(req, res, next) {
let title = req.body.title;
let img = req.body.image;
let blog = req.body.description;
let newblog = {title, img, blog};

// write it to the db
MongoClient.connect(url, function(err, db){
  if (err) throw err;
  let dbo = db.db("portfolio");
  // get the projects
  dbo.collection('blog').insertOne(newblog, function(err, newblog){
      if (err) throw err;
      console.log(JSON.stringify(newblog));
      db.close();
      // redirect to list of projects page
      res.redirect('/adminpanel/blog')
  })
});
});

// --------------------------Delete Blog----------------------------------------
router.get('/blog/:id/delete',  function(req, res, next) {
let id = req.params.id;
MongoClient.connect(url, function(err, db){
  if (err) throw err;
  let dbo = db.db("portfolio");
  dbo.collection('blog').deleteOne({_id: new ObjectId(id)}, function(err, p){
    if (err) throw err;
    console.log(JSON.stringify(p));
    db.close();
    res.redirect('/adminpanel/blog');
  })
});
});

// ---------------------------- Contact List ---------------------------------------------------
router.get('/contactlist',function(req,res,next){
  MongoClient.connect(url,function(err,db){
    if(err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('contact').find().toArray(function(err,contact){
      if(err) throw err;
      console.log(JSON.stringify(contact));
      db.close();
      res.render('contactlist', {layout: 'listlayout', contact: contact})

    })
  })
})




// --------------------------Delete Contact----------------------------------------
router.get('/contactlist/:id/delete',  function(req, res, next) {
  let id = req.params.id;
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('contact').deleteOne({_id: new ObjectId(id)}, function(err, p){
      if (err) throw err;
      console.log(JSON.stringify(p));
      db.close();
      res.redirect('/adminpanel/contactlist');
    })
  });
  });



// ---------------------------- Subscribe List ---------------------------------------------------
router.get('/subscribelist',function(req,res,next){
  MongoClient.connect(url,function(err,db){
    if(err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('newsletter').find().toArray(function(err,subscribe){
      if(err) throw err;
      console.log(JSON.stringify(subscribe));
      db.close();
      res.render('subscribelist', {layout: 'listlayout', subscribe: subscribe})

    })
  })
})




// --------------------------Delete subscribe----------------------------------------
router.get('/subscribelist/:id/delete',  function(req, res, next) {
  let id = req.params.id;
  MongoClient.connect(url, function(err, db){
    if (err) throw err;
    let dbo = db.db("portfolio");
    dbo.collection('newsletter').deleteOne({_id: new ObjectId(id)}, function(err, subscribe){
      if (err) throw err;
      console.log(JSON.stringify(subscribe));
      db.close();
      res.redirect('/adminpanel/subscribelist');
    })
  });
  });
  

// ----------------------------- Logout -----------------------------------------------
router.get('/logout',  function(req, res, next) {
req.session.isLoggedIn = false;
delete req.session.user;
res.redirect('/admin')
})






  module.exports = router;
