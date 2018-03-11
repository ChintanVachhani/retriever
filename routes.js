const express = require('express');
const {google} = require('googleapis');
const firebaseAdmin = require('./firebase');
const Json2csv = require('json2csv');

const Json2csvParser = Json2csv.Parser;
const router = express.Router();
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(process.env.GOOGLE_SIGN_IN_CLIENT_ID, process.env.GOOGLE_SIGN_IN_CLIENT_SECRET, process.env.GOOGLE_SIGN_IN_CALLBACK_URL);

// Get a database reference to our data
const db = firebaseAdmin.database();
const ref = db.ref("/contacts");
let data;

ref.on("value", function (snapshot) {
    data = snapshot.val();
    console.log(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

/* GET dashboard page. */
router.get('/', function (req, res) {
    res.render('dashboard', {
        title: 'Retriever',
        activePage: 'dashboard',
        notification: null,
        data: data,
        isAuthenticated: req.session.tokens
    });
});

/* Download data as csv file. */
router.get('/csv', (req, res, next) => {
    req.session.tokens ? next() : res.redirect('/');
}, function (req, res) {
    let csv;
    const fields = ['name', 'email', 'phone', 'experience'];
    try {
        const parser = new Json2csvParser({fields});
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
    const url = oauth2Client.generateAuthUrl({
        access_type: 'online',
        scope: 'profile email'
    });
    res.redirect(url);
});

router.get('/oauth2callback', function (req, res, next) {
    oauth2Client.getToken(req.query.code, (err, tokens) => {
        if (err) {
            // set locals, only providing error in development
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // render the error page
            res.status(err.status || 500);
            res.render('error', {
                title: 'Retriever',
                activePage: 'error',
                isAuthenticated: false
            });
        }
        req.session.tokens = tokens;
        oauth2Client.setCredentials(req.session.tokens);
        res.redirect('/');
    });
});

router.get('/signout', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
