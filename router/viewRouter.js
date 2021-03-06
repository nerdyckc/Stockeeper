const passport = require('passport');
const knexConfig = require('../knexfile').development;
const knex = require('knex')(knexConfig);
const PortfolioService = require('../utils/PortfolioService');
let ps = new PortfolioService(knex);

module.exports = (express) => {
    const router = express.Router();
    let portfoList = [];

    async function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            // as soon as user logged in, retrieve portfolio list
            portfoList = await ps.listPortfolios(req.session.passport.user)
            return next();
        }

        // res.redirect('/login');
        res.redirect('/welcome');
    }

    router.get('/welcome', (req, res) => {
        res.render("welcome", {
            pageTitle: 'Welcome',
            pageID: 'welcome'
        });
    });

    router.get('/',isLoggedIn, (req, res) => {
        // res.render("index", {
        //     pageTitle: 'Index',
        //     pageID: 'index',
        //     portfoList: portfoList
        // });
        res.render('home', {
            pageTitle: 'Home',
            pageID: 'home',
            portfoList: portfoList
        });
    });

    router.get('/login', (req, res) => {
        res.render('login', {
            pageTitle: 'Login',
            pageID: 'login',
            "message-display":"none"
        });
    });

    router.post('/login', function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) { return next(err); }
            if (!user) {
                // req.session.message = info.message;
                return res.render('login', {
                    pageTitle: 'Login',
                    pageID: 'login',
                    message: info.message,
                    "message-display":"block"
                });
            }
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                return res.redirect('/home');
            });
        })(req, res, next);
    });

    router.get('/signup', (req, res) => {
        res.render('signup', {
            pageTitle: 'Signup',
            pageID: 'signup'
        });
    });

    router.post('/signup',passport.authenticate('local-signup', {
        successRedirect: '/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.get("/auth/google", passport.authenticate('googleToken', {
        scope: ['profile', 'email']
    }));
    router.get("/auth/google/redirect", passport.authenticate('googleToken', {
        failureRedirect: "/"
    }),(req,res)=>res.redirect('/home'));

    router.get("/auth/facebook", passport.authenticate('facebook', {
        scope: ['user_friends', 'manage_pages']
    }));
    router.get("/auth/facebook/callback", passport.authenticate('facebook', {
        failureRedirect: "/"
    }),(req,res)=>res.redirect('/home'));

    // router.get('/index',isLoggedIn, (req, res) => {
    //     res.render("index", { 
    //       username: req.user.username,
    //       pageTitle: 'Index',
    //       pageID: 'index',
    //       portfoList: portfoList
    //     });
    // });

    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/home', function (req, res) {
        res.render('home', {
            pageTitle: 'Home',
            pageID: 'home',
            portfoList: portfoList
        });
    });
    router.get('/search', isLoggedIn, function (req, res) {
        res.render('search', {
            pageTitle: 'Search',
            pageID: 'search',
            portfoList: portfoList
        });
    });

    router.get('/portfolio', isLoggedIn, function (req, res) {
        res.render('portfolio', {
            pageTitle: 'Portfolio',
            pageID: 'portfolio',
            portfoList: portfoList
        });
    });

    router.get('/chat', isLoggedIn, function (req, res) {
        res.render('chat', {
            pageTitle: 'Chat Room',
            pageID: 'chat',
            portfoList: portfoList
        });
    });

    router.get('/stock/:symbol', isLoggedIn, function (req, res) {
        res.render('stock', { symbol: req.params.symbol })
    });

    router.get('/addTran/:symbol', isLoggedIn, function (req, res) {
        res.render('addTran', { symbol: req.params.symbol })
    });

    return router;
};