const express = require('express');
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const mailto = require('./routes/mailto');  
const jobs = require('./routes/api/jobs');  
//const testAPI = require('./routes/api/testAPI'); 
const passport = require('./config/passport'); 
const cors = require('cors');
const methodOverride = require('method-override');
 
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(methodOverride('_method')); 

// Passport middleware
passport.init(app);


app.get('/', (req, res) => res.send("Hello World"));

// USE routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/mailto', mailto);
app.use('/api/jobs', jobs);
//app.use('/api/testAPI', testAPI);


 

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
