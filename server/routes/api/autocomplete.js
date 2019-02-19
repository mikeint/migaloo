const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');

const postgresdb = require('../../config/db').postgresdb;

/**
 * Get experience by autocomplete
 * @route GET api/autocomplete/experience
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/experience/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT experience_type_name, experience_type_id \
            FROM experience_type \
            WHERE lower(experience_type_name) LIKE $1 \
            ORDER BY experience_type_name ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%").then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
router.get('/experience', passport.authentication, (req, res) => {
    postgresdb.any('SELECT experience_type_name, experience_type_id \
            FROM experience_type \
            ORDER BY experience_type_name ASC').then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Get tag by autocomplete
 * @route GET api/autocomplete/tag
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/tag/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT tag_name, tag_id \
            FROM tags \
            WHERE lower(tag_name) LIKE $1 \
            ORDER BY tag_name ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%").then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
router.get('/tag', passport.authentication, (req, res) => {
    postgresdb.any('SELECT tag_name, tag_id \
            FROM tags \
            ORDER BY tag_name ASC').then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Get tag by autocomplete
 * @route GET api/autocomplete/tag
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/addTag/:tag', passport.authentication, (req, res) => {
    // TODO: BIG NOTE, XSS potential ensure we are using pre tag on front end, and cleaning this out periodically
    var tag = req.params.tag
    postgresdb.one('INSERT INTO tags (tag_name) VALUES ($1) RETURNING tag_id', tag)
    .then(data => {
        console.log({tag_id: data.tag_id, tag_name:tag})
        res.json({tag_id: data.tag_id, tag_name:tag});
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

/**
 * Get salary by autocomplete
 * @route GET api/autocomplete/salary
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/salary/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT salary_type_name, salary_type_id \
            FROM salary_type \
            WHERE lower(salary_type_name) LIKE $1 \
            ORDER BY salary_type_name ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%").then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});
router.get('/salary', passport.authentication, (req, res) => {
    postgresdb.any('SELECT salary_type_name, salary_type_id \
            FROM salary_type \
            ORDER BY salary_type_name ASC').then(data => {
        res.json(data);
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
});

module.exports = router;