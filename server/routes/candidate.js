const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const validateCandidateInput = require('../validation/candidate');  
const logger = require('../utils/logging');
const address = require('../utils/address');

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const camelColumnConfig = db.camelColumnConfig
const candidateTagsInsertHelper = new pgp.helpers.ColumnSet(['candidate_id', 'tag_id'], {table: 'candidate_tags'});

const candidateFields = ['first_name', 'last_name', 'experience', 'salary', 'relocatable', 'url', 'address_id'];
const candidateInsert = new pgp.helpers.ColumnSet(['candidate_id', ...candidateFields].map(camelColumnConfig), {table: 'candidate'});
const candidateUpdate = new pgp.helpers.ColumnSet(['?candidate_id', ...candidateFields.map(camelColumnConfig)], {table: 'candidate'});
/**
 * Create a new candidate for the recruiter
 * @route POST api/candidate/create
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/create', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * firstName
     * lastName
     * address
     * url (Optional)
     * relocatable
     * salary
     * experience
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validateCandidateInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Must be an recruiter to add a candidate"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }

    postgresdb.tx(t => {
        // creating a sequence of transaction queries:
        const qCheck = t.any('SELECT user_id FROM login WHERE email = lower(${email})',
                    {email:body.email})
        return qCheck.then(email_exists=>{
            if(email_exists && email_exists.length > 0){
                return Promise.resolve(email_exists[0])
            }else{
                return t.one('INSERT INTO login (email) VALUES (lower(${email})) RETURNING user_id',
                    {email:body.email})
            }
        }).then((candidate_ret)=>{
            return address.addAddress(body.address, t)
            .then((address_ret)=>{
                const q2 = t.none(pgp.helpers.insert({...body, candidateId:candidate_ret.user_id, addressId:address_ret.address_id}, candidateInsert))
                const q3 = t.none('INSERT INTO recruiter_candidate (candidate_id, recruiter_id) VALUES ($1, $2)',
                                    [candidate_ret.user_id, jwtPayload.id])
                var queries = [q2, q3];
                if(body.tagIds != null && body.tagIds.length > 0){
                    const query = pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: candidate_ret.user_id, tag_id: d}}), candidateTagsInsertHelper);
                    const q4 = t.none(query);
                    queries.push(q4)
                }
                // logger.info('Recruiter added candidate', {tags:['candidate', 'recruiter'], url:req.originalUrl, userId:jwtPayload.id, body: {...req.body, candidateId:candidate_ret.user_id}});
                return t.batch(queries)
            })
        })
    }).then(()=>{
        res.json({success: true})
    }).catch((err)=>{
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * Edit a candidate for the recruiter
 * @route POST api/candidate/edit
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.post('/edit', passport.authentication,  (req, res) => {

    /**
     * Inputs Body:
     * candidateId
     * firstName
     * lastName
     * address
     * url (Optional)
     * relocatable
     * salary
     * experience
     * tagIds (Optional)
     */
    var body = req.body
    const { errors, isValid } = validateCandidateInput(body);
    //check Validation
    if(!isValid) {
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Must be an recruiter to add a candidate"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    if(jwtPayload.candidateId == null){
        const errorMessage = "Missing candidateId field"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    
    postgresdb.tx(t => {
        var q1
        if(bady.addressId != null)
            q1 = Promise.resolve({address_id:null})
        else
            q1 = address.addAddress(body.address, t)
        return q1.then((address_ret)=>{
            const q2 = t.none('DELETE FROM candidate_tags WHERE candidate_id = $1', [body.candidateId])
            const q3 = t.none(pgp.helpers.update({...body, candidateId:candidate_ret.user_id, addressId:address_ret.address_id}, candidateUpdate, null, {tableAlias: 'X', valueAlias: 'Y'}) + ' WHERE Y.candidateId = X.candidate_id')
            return t.batch([q2, q3]).then(()=>{
                if(body.tagIds != null && body.tagIds.length > 0){
                    const query = pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: candidate_ret.user_id, tag_id: d}}), candidateTagsInsertHelper);
                    return t.none(query).then(()=>{
                        return res.json({success: true})
                    }).catch((err)=>{
                        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                        return res.status(500).json({success: false, error:err})
                    });
                }else{
                    res.json({success: true})
                    return []
                }
            }).catch((err)=>{
                logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
                return res.status(500).json({success: false, error:err})
            });
        }).catch((err)=>{
            logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
            return res.status(500).json({success: false, error:err})
        });
    }).catch((err)=>{
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        return res.status(500).json({success: false, error:err})
    });
});

/**
 * List the candidates for the recruiter
 * @route POST api/candidate/list
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/list', passport.authentication, listCandidates);
router.get('/list/:page', passport.authentication, listCandidates);
router.get('/list/:page/:search', passport.authentication, listCandidates);
router.get('/getCandidate/:candidateId', passport.authentication, listCandidates);
function listCandidates(req, res){
    var search = req.params.search;
    var candidateId = req.params.candidateId;
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    var sqlArgs = [jwtPayload.id, (page-1)*10]
    if(search != null)
        sqlArgs.push(search.split(' ').map(d=>d+":*").join(" & "))
    if(candidateId != null)
        sqlArgs.push(candidateId)
    postgresdb.any(' \
        SELECT c.candidate_id, c.first_name, c.last_name, l.email, rc.created_on, c.resume_id, c.experience, \
            coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
            coalesce(cpd.not_accepted_count, 0) as not_accepted_count, coalesce(cpd.coins_spent, 0) as coins_spent, \
            coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
            (count(1) OVER())/10+1 AS page_count, tag_names, tag_ids \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        INNER JOIN login l ON l.user_id = c.candidate_id \
        LEFT JOIN ( \
            SELECT ct.candidate_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
            FROM candidate_tags ct \
            INNER JOIN tags t ON t.tag_id = ct.tag_id \
            GROUP BY candidate_id \
        ) tg ON tg.candidate_id = c.candidate_id \
        LEFT JOIN ( \
            SELECT cp.candidate_id, \
                SUM(1) as posted_count, \
                SUM(cast(migaloo_accepted as int)) as accepted_count, \
                SUM(cast(migaloo_accepted as int)) as not_accepted_count, \
                SUM(coins) as coins_spent, \
                SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_accepted_count, \
                SUM(CASE WHEN NOT has_seen_response AND NOT migaloo_accepted THEN 1 ELSE 0 END) as new_not_accepted_count \
            FROM candidate_posting cp\
            WHERE cp.recruiter_id = $1 \
            GROUP BY cp.candidate_id \
        ) cpd ON cpd.candidate_id = c.candidate_id\
        WHERE rc.recruiter_id = $1 AND l.active \
        '+
        (candidateId ? 'ORDER BY (CASE WHEN c.candidate_id = $3 THEN 1 ELSE 0 END) DESC, c.last_name ASC, c.first_name ASC' :
        (search ? 
            'AND (name_search @@ to_tsquery(\'simple\', $3)) \
            ORDER BY ts_rank_cd(name_search, to_tsquery(\'simple\', $3)) DESC'
        :
            'ORDER BY c.last_name ASC, c.first_name ASC'
        ))+' \
        OFFSET $2 \
        LIMIT 10', sqlArgs)
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json({candidateList:data, success:true})
    })
    .catch(err => {
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });
}


/**
 * List the candidates for the recruiter
 * @route POST api/candidate/list
 * @group candidate - Candadite Listings
 * @param {Object} body.optional
 * @returns {object} 200 - Success Message
 * @returns {Error}  default - Unexpected error
 * @access Private
 */
router.get('/listForJob/:postId', passport.authentication, listCandidatesForJob);
router.get('/listForJob/:postId/:page', passport.authentication, listCandidatesForJob);
router.get('/listForJob/:postId/:page/:search', passport.authentication, listCandidatesForJob);
function listCandidatesForJob(req, res){
    const search = req.params.search;
    var page = req.params.page;
    if(page == null)
        page = 1;
    const jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        const errorMessage = "Invalid User Type"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const postId = req.params.postId
    if(postId == null){
        const errorMessage = "Missing post Id"
        logger.error('Route Params Mismatch', {tags:['validation'], url:req.originalUrl, userId:jwtPayload.id, body: req.body, error:errorMessage});
        return res.status(400).json({success:false, error:errorMessage})
    }
    const recruiterId = jwtPayload.id;
    

    postgresdb.task(t => {
        return t.one('SELECT jp.post_id, jp.title, jp.salary, jp.experience, tg.tag_names \
            FROM job_posting jp \
            LEFT JOIN ( \
                SELECT pt.post_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                FROM posting_tags pt \
                INNER JOIN tags t ON t.tag_id = pt.tag_id \
                GROUP BY post_id \
            ) tg ON tg.post_id = jp.post_id \
            WHERE jp.post_id = ${postId} AND jp.recruiter_id = ${recruiterId}', {postId:postId, recruiterId:recruiterId})
        .then(job_data=>{
            var sqlArgs = {recruiterId:jwtPayload.id, postId:postId, page:(page-1)*10}
            if(search != null)
                sqlArgs['search'] = search.split(' ').map(d=>d+":*").join(" & ")
            return t.any(' \
                SELECT c.candidate_id, c.first_name, c.last_name, l.email, rc.created_on, c.resume_id, c.experience, \
                    coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
                    coalesce(cpd.not_accepted_count, 0) as not_accepted_count, \
                    coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
                    (count(1) OVER())/10+1 AS page_count, tag_names, tag_ids, \
                    coalesce(salary_score, 0.0)*coalesce(experience_score, 0.0)*coalesce(tag_score, 0.0)*100.0 as score  \
                FROM recruiter_candidate rc \
                INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
                INNER JOIN login l ON l.user_id = c.candidate_id \
                LEFT JOIN ( \
                    SELECT ct.candidate_id, array_agg(t.tag_name) as tag_names, array_agg(t.tag_id) as tag_ids \
                    FROM candidate_tags ct \
                    INNER JOIN tags t ON t.tag_id = ct.tag_id \
                    GROUP BY candidate_id \
                ) tg ON tg.candidate_id = c.candidate_id \
                LEFT JOIN ( \
                    SELECT cp.candidate_id, \
                        SUM(1) as posted_count, \
                        SUM(cast(migaloo_accepted as int)) as accepted_count, \
                        SUM(cast(migaloo_accepted as int)) as not_accepted_count, \
                        SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_accepted_count, \
                        SUM(CASE WHEN NOT has_seen_response AND migaloo_accepted THEN 1 ELSE 0 END) as new_not_accepted_count \
                    FROM candidate_posting cp\
                    WHERE cp.recruiter_id = ${recruiterId} \
                    GROUP BY cp.candidate_id \
                ) cpd ON cpd.candidate_id = c.candidate_id \
                INNER JOIN ( \
                    SELECT c.candidate_id, \
                        least(greatest((max(j.salary)-max(c.salary))/10.0, -1)+1, 1) \
                        -least(greatest((max(j.salary)-max(c.salary))/50.0, 0), 1) as salary_score, \
                        least(greatest((max(j.experience)-max(c.experience))/15.0, -1)+1, 1) \
                        -least(greatest((max(j.experience)-max(c.experience))/10.0, 0), 1) as experience_score, \
                        max(a.lat) as lat, \
                        max(a.lon) as lon, \
                        SUM(similarity) / count(distinct tg.tag_id) as tag_score \
                    FROM ( \
                        SELECT ct.tag_id, ct.candidate_id, pt.post_id, MAX(similarity) as similarity \
                        FROM candidate_tags ct \
                        INNER JOIN tags_equality te ON te.tag_id_1 = ct.tag_id \
                        INNER JOIN posting_tags pt ON te.tag_id_2 = pt.tag_id \
                        INNER JOIN recruiter_candidate rc ON rc.candidate_id = ct.candidate_id \
                        WHERE pt.post_id = ${postId} AND rc.recruiter_id = ${recruiterId} \
                        GROUP BY ct.tag_id, ct.candidate_id, pt.post_id \
                    ) tg \
                    INNER JOIN job_posting j ON j.post_id = tg.post_id \
                    INNER JOIN address a ON j.address_id = a.address_id \
                    FULL JOIN candidate c ON tg.candidate_id = c.candidate_id \
                    WHERE j.is_visible AND j.recruiter_id = ${recruiterId} AND j.post_id = ${postId} \
                    GROUP BY c.candidate_id \
                ) jc ON jc.candidate_id = rc.candidate_id \
                WHERE rc.recruiter_id = ${recruiterId} AND l.active \
                '+
                (search ? 
                    'AND (name_search @@ to_tsquery(\'simple\', ${search}))'
                :'')+' \
                ORDER BY coalesce(salary_score, 0.0)*coalesce(experience_score, 0.0)*coalesce(tag_score, 0.0)*100.0 DESC, c.last_name ASC, c.first_name ASC \
                OFFSET ${page} \
                LIMIT 10', sqlArgs)
            .then((data) => {
                // Marshal data
                data = data.map(m=>{
                    var timestamp = moment(m.created_on);
                    var ms = timestamp.diff(moment());
                    m.created = moment.duration(ms).humanize() + " ago";
                    m.created_on = timestamp.format("x");
                    return m
                })
                res.json({candidateList:data, postData:job_data, success:true})
            })
        })
    })
    .catch(err => {
        logger.error('Candidate Call Failed', {tags:['sql'], url:req.originalUrl, userId:jwtPayload.id, error:err.message || err, body:req.body});
        res.status(500).json({success:false, error:err})
    });;
}

module.exports = router;