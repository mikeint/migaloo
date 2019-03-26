const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const mailto = require('./routes/mailto');  
const recruiterJobs = require('./routes/api/recruiterJobs');  
const employerPostings = require('./routes/api/employerPostings');
const employer = require('./routes/api/employer'); 
const recruiter = require('./routes/api/recruiter');
const candidate = require('./routes/api/candidate');  
const profileImage = require('./routes/api/profileImage');  
const message = require('./routes/api/message');  

const resume = require('./routes/api/resume');  
const autocomplete = require('./routes/api/autocomplete');  
//const testAPI = require('./routes/api/testAPI'); 
const passport = require('./config/passport'); 
const cors = require('cors');
const methodOverride = require('method-override');

const app = express();

var logger = require('morgan');
app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())
app.use(methodOverride('_method')); 

// Passport middleware
passport.init(app);
app.use('/api/public/', express.static(path.join(`${__dirname}/public/`)))

app.get('/', (req, res) => res.send("Hello World"));

// USE routes
app.use('/api/users', users);
app.use('/api/mailto', mailto);
app.use('/api/recruiterJobs', recruiterJobs);
app.use('/api/employerPostings', employerPostings);
app.use('/api/employer', employer);
app.use('/api/recruiter', recruiter);
app.use('/api/candidate', candidate);
app.use('/api/profileImage', profileImage);
app.use('/api/autocomplete', autocomplete);
app.use('/api/resume', resume);
app.use('/api/message', message);
//app.use('/api/testAPI', testAPI);


 

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
