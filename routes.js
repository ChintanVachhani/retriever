var express = require('express');
var router = express.Router();
var firebaseAdmin = require('./firebase');
var Json2csvParser = require('json2csv').Parser;

// Get a database reference to our data
var db = firebaseAdmin.database();
var ref = db.ref("/contacts");
var data;

ref.on("value", function (snapshot) {
    data = snapshot.val();
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

var notification;
/* GET dashboard page. */
router.get('/', function (req, res) {
    res.render('dashboard', {
        title: 'Retriever',
        activePage: 'dashboard',
        notification: null,
        data: data,
        isAuthenticated: false
    });
});

/* Download data as csv file. */
router.get('/csv', function (req, res) {
    var csv;
    var fields = ['name', 'email', 'phone', 'experience'];
    try {
        var parser = new Json2csvParser({fields});
        csv = parser.parse(data);
        console.log(csv);
    } catch (err) {
        console.error(err);
    }
    process.nextTick(function () {
        res.attachment('data.csv');
        res.send(csv);
    });
});


router.get('/signin', function (req, res, next) {
});


router.get('/signout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
