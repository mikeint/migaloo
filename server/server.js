const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const mailto = require('./routes/mailto');  
//const testAPI = require('./routes/api/testAPI'); 
const passport = require('passport'); 
const cors = require('cors');
const methodOverride = require('method-override');
 
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(methodOverride('_method')); 


const db = require('./config/keys').mongoURI;

// connect to mongoDB through mongoose
mongoose
    .connect(db)
    .then(() => console.log(`connected to ${db}`))
    .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);


app.get('/', (req, res) => res.send("Hello World"));

// USE routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/mailto', mailto);
//app.use('/api/testAPI', testAPI);


 

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
