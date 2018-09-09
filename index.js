/********************

Maw Server
(c) 2018 Eternity Echo

Authors:
Marino, Jude Wincel P.
Romero, Justine Che T.

*******************/
const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');

const app = express();


//load routes
const maws = require('./routes/maws');
const users = require('./routes/users')

//Paspport config
require('./config/passport')(passport);

//DB config
const db = require('./config/database'); 


// connect to mongoose
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true
})
.then(() => console.log('MongoDB Connected...'))
.catch( err => console.log(err));


//handlebars middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//static folder
app.use(express.static(path.join(__dirname, 'public')))

// method override middleware
app.use(methodOverride('_method'));

//express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
   // cookie: { secure: true }
  }))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//global vairables
app.use(function(req,res,next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg= req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//index route
app.get('/', (req,res) => {
    res.render('index');
});



app.get('/about', (req,res) => {
    res.render('about');
});


//use routes
app.use('/maws', maws);
app.use('/users', users);





//breeding api
var breedingAPI = require('./breeding-api.js');						//Import Breeding api
breedingAPI.init(app);




const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Server started on port ${port}`);
});

