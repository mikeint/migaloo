const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const logger = require('../utils/logging');

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp

/**
 * Get job type by autocomplete
 * @route GET api/autocomplete/jobType
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/jobType/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT job_type_name as "jobTypeName", job_type_id as "jobTypeId" \
            FROM job_type \
            WHERE lower(job_type_name) LIKE $1 \
            ORDER BY job_type_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, jobTypeList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/jobType', passport.authentication, (req, res) => {
    postgresdb.any('SELECT job_type_name as "jobTypeName", job_type_id as "jobTypeId" \
            FROM job_type \
            ORDER BY job_type_id ASC')
    .then(data => {
        res.json({success:true, jobTypeList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Get benefit listing
 * @route GET api/autocomplete/benefits
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/benefits', passport.authentication, (req, res) => {
    postgresdb.any('SELECT * \
            FROM benefits \
            ORDER BY group_num ASC, benefit_id ASC')
    .then(data => {
        console.log(data)
        res.json({success:true, benefits: data.map(d=>db.camelizeFields(d))});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
/**
 * Get job type by autocomplete
 * @route GET api/autocomplete/openReason
 * @group autocomplete - Autocomplete
 * @returns {object} 200 - A list of maps containing autocompletes
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/openReason/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT opening_reason_name as "openingReasonName", opening_reason_id as "openingReasonId" \
            FROM opening_reason \
            WHERE lower(opening_reason_name) LIKE $1 \
            ORDER BY opening_reason_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, openReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/openReason', passport.authentication, (req, res) => {
    postgresdb.any('SELECT opening_reason_name as "openingReasonName", opening_reason_id as "openingReasonId" \
            FROM opening_reason \
            ORDER BY opening_reason_id ASC')
    .then(data => {
        res.json({success:true, openReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
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
router.get('/tagByType/:tagTypeId/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT t.tag_name as "tagName", t.tag_id as "tagId", tt.tag_type_name as "tagTypeName", COALESCE(cnt.tag_count, 0) as "tagCount" \
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
            WHERE lower(t.tag_name) LIKE ${find} \
            ORDER BY CASE WHEN t.tag_type_id = ${tagTypeId} THEN 1 ELSE 0 END DESC, t.frequency DESC \
            LIMIT 10', {tagTypeId:req.params.tagTypeId, find:"%"+req.params.find.toLowerCase()+"%"})
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/tagByType/:tagTypeId', passport.authentication, (req, res) => {
    postgresdb.any('SELECT t.tag_name as "tagName", t.tag_id as "tagId", tt.tag_type_name as "tagTypeName", COALESCE(cnt.tag_count, 0) as "tagCount" \
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
            ORDER BY CASE WHEN t.tag_type_id = ${tagTypeId} THEN 1 ELSE 0 END DESC, t.frequency DESC \
            LIMIT 10', {tagTypeId:req.params.tagTypeId})
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/tag/:find', passport.authentication, (req, res) => {
    postgresdb.any('SELECT t.tag_name as "tagName", t.tag_id as "tagId", tt.tag_type_name as "tagTypeName", COALESCE(cnt.tag_count, 0) as "tagCount" \
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
            WHERE lower(t.tag_name) LIKE ${find} \
            ORDER BY t.frequency DESC \
            LIMIT 10', {find:"%"+req.params.find.toLowerCase()+"%"})
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/tag', passport.authentication, (req, res) => {
    postgresdb.any('SELECT t.tag_name as "tagName", t.tag_id as "tagId", tt.tag_type_name as "tagTypeName", COALESCE(cnt.tag_count, 0) as "tagCount" \
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
            ORDER BY t.frequency DESC \
            LIMIT 10')
    .then(data => {
        res.json({success:true, tagList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
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
router.post('/addTag/:tagTypeId/:tag', passport.authentication, (req, res) => {
    // TODO: BIG NOTE, XSS potential ensure we are using pre tag on front end, and cleaning this out periodically
    var tag = req.params.tag
    var tagTypeId = req.params.tagTypeId
    postgresdb.one('INSERT INTO tags (tag_name, tag_type_id) \
    VALUES (${tagName}, ${tagTypeId}) ON CONFLICT("tag_name", "tag_type_id") DO UPDATE SET tag_name=EXCLUDED.tag_name RETURNING tag_id', {tagName:tag, tagTypeId:tagTypeId})
    .then(data => {
        res.json({success:true, tagId:data.tag_id, tagName:tag});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
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
    postgresdb.any('SELECT denial_reason_text as "denialReasonText", denial_reason_id as "denialReasonId" \
            FROM denial_reason \
            WHERE lower(denial_reason_text) LIKE $1 \
            ORDER BY denial_reason_id ASC \
            LIMIT 10', "%"+req.params.find.toLowerCase()+"%")
    .then(data => {
        res.json({success:true, denialReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});
router.get('/denialReason', passport.authentication, (req, res) => {
    postgresdb.any('SELECT denial_reason_text as "denialReasonText", denial_reason_id as "denialReasonId" \
            FROM denial_reason \
            ORDER BY denial_reason_id ASC')
    .then(data => {
        res.json({success:true, denialReasonList: data});
    })
    .catch(err => {
        logger.error('Autocomplete Call Failed', {tags:['sql'], url:req.originalUrl, userId:req.body.jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
});

module.exports = router;