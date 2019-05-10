const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const logger = require('../utils/logging');

const postgresdb = require('../config/db').postgresdb;

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
            ORDER BY experience_type_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, experienceList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/experience', passport.authentication, (req, res) => {
    postgresdb.any('SELECT experience_type_name, experience_type_id \
            FROM experience_type \
            ORDER BY experience_type_id ASC')
    .then(data => {
        res.json({success:true, experienceList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
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
    postgresdb.any('SELECT t.tag_name, t.tag_id, tt.tag_type_name, COALESCE(cnt.tag_count, 0) as tag_count \
            FROM tags t \
            LEFT JOIN ( \
                SELECT tag_id, count(1) as tag_count \
                FROM ( \
                SELECT tag_id FROM posting_tags \
                UNION ALL \
                SELECT tag_id FROM candidate_tags \
                ) un \
                GROUP BY tag_id \
            ) cnt ON cnt.tag_id = t.tag_id \
            INNER JOIN tag_type tt ON tt.tag_type_id = t.tag_type_id \
            WHERE lower(t.tag_name) LIKE $1 \
            ORDER BY length(t.tag_name) ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/tag', passport.authentication, (req, res) => {
    postgresdb.any('SELECT t.tag_name, t.tag_id, tt.tag_type_name, COALESCE(cnt.tag_count, 0) as tag_count \
            FROM tags t \
            LEFT JOIN ( \
                SELECT tag_id, count(1) as tag_count \
                FROM ( \
                SELECT tag_id FROM posting_tags \
                UNION ALL \
                SELECT tag_id FROM candidate_tags \
                ) un \
                GROUP BY tag_id \
            ) cnt ON cnt.tag_id = t.tag_id \
            INNER JOIN tag_type tt ON tt.tag_type_id = t.tag_type_id \
            ORDER BY t.tag_name ASC \
            LIMIT 10')
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
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
        res.json({tag_id: data.tag_id, tag_name:tag});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
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
            ORDER BY salary_type_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, salaryList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/salary', passport.authentication, (req, res) => {
    postgresdb.any('SELECT salary_type_name, salary_type_id \
            FROM salary_type \
            ORDER BY salary_type_id ASC')
    .then(data => {
        res.json({success:true, salaryList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Get denial reason by autocomplete
 * @route GET api/autocomplete/denialReason
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/denialReason/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT denial_reason_text, denial_reason_id \
            FROM denial_reason \
            WHERE lower(denial_reason_text) LIKE $1 \
            ORDER BY denial_reason_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, denialReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/denialReason', passport.authentication, (req, res) => {
    postgresdb.any('SELECT denial_reason_text, denial_reason_id \
            FROM denial_reason \
            ORDER BY denial_reason_id ASC')
    .then(data => {
        res.json({success:true, denialReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

module.exports = router;