const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const moment = require('moment');
const validateCandidateInput = require('../validation/candidate');  
const logger = require('../utils/logging');

const db = require('../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const candidateTagsInsertHelper = new pgp.helpers.ColumnSet(['candidate_id', 'tag_id'], {table: 'candidate_tags'});


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
     * salaryTypeId (Optional)
     * experienceTypeId (Optional)
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
        const q1 = t.one('INSERT INTO login (email) VALUES ($1) RETURNING user_id ON CONFLICT DO UPDATE email = EXCLUDED.email RETURNING user_id',
                            [body.email])
        return q1.then((candidate_ret)=>{
            const q2 = t.none('INSERT INTO recruiter_candidate (candidate_id, recruiter_id) VALUES ($1, $2)',
                                [candidate_ret.user_id, jwtPayload.id])
            const q3 = t.none('INSERT INTO candidate (first_name, last_name, experience_type_id, salary_type_id) VALUES ($1, $2, $3, $4)',
                                [body.firstName, body.lastName, body.experienceTypeId, body.salaryTypeId])
            var queries = [q2, q3];
            if(body.tagIds != null && body.tagIds.length > 0){
                const query = pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: candidate_ret.user_id, tag_id: d}}), candidateTagsInsertHelper);
                const q4 = t.none(query);
                queries.push(q4)
            }
            return t.batch(queries).then(()=>{
                res.json({success: true})
            })
            
        })
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
        SELECT c.candidate_id, c.first_name, c.last_name, l.email, rc.created_on, c.resume_id, et.experience_type_name, \
            coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
            coalesce(cpd.not_accepted_count, 0) as not_accepted_count, coalesce(cpd.coins_spent, 0) as coins_spent, \
            coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
            (count(1) OVER())/10+1 AS page_count, tag_names, tag_ids \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        LEFT JOIN experience_type et ON c.experience_type_id = et.experience_type_id \
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
        WHERE rc.recruiter_id = $1 AND c.active \
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
        return t.one('SELECT jp.post_id, jp.title, st.salary_type_name, et.experience_type_name, tg.tag_names \
            FROM job_posting jp \
            LEFT JOIN experience_type et ON jp.experience_type_id = et.experience_type_id \
            LEFT JOIN salary_type st ON jp.salary_type_id = st.salary_type_id \
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
                SELECT c.candidate_id, c.first_name, c.last_name, l.email, rc.created_on, c.resume_id, et.experience_type_name, \
                    coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
                    coalesce(cpd.not_accepted_count, 0) as not_accepted_count, \
                    coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
                    (count(1) OVER())/10+1 AS page_count, tag_names, tag_ids, \
                    score, total_score, score/total_score*100.0 as tag_score  \
                FROM recruiter_candidate rc \
                INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
                LEFT JOIN experience_type et ON c.experience_type_id = et.experience_type_id \
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
                    SELECT ci.candidate_id, (COUNT(1) + \
                        (CASE WHEN count(j.experience_type_id) = 0 OR count(ci.experience_type_id) = 0 THEN 0 ELSE greatest(2-abs(least(max(j.experience_type_id - ci.experience_type_id), 0)), 0)/2.0 END) + \
                        (CASE WHEN count(j.salary_type_id) = 0 OR count(ci.salary_type_id) = 0 THEN 0 ELSE greatest(5-abs(least(max(j.salary_type_id - ci.salary_type_id), 0)), 0)/5.0 END)) as score, \
                        ( \
                            SELECT COUNT(1)+count(distinct ci.experience_type_id)+count(distinct ci.salary_type_id) \
                            FROM posting_tags cti \
                            WHERE cti.post_id = ${postId} \
                        ) as total_score \
                    FROM candidate_tags ct \
                    INNER JOIN posting_tags pt ON pt.tag_id = ct.tag_id \
                    INNER JOIN job_posting j ON j.post_id = pt.post_id \
                    INNER JOIN candidate ci ON ci.candidate_id = ct.candidate_id \
                    WHERE j.post_id = ${postId} AND j.recruiter_id = ${recruiterId} \
                    GROUP BY ci.candidate_id \
                ) jc ON jc.candidate_id = rc.candidate_id \
                WHERE rc.recruiter_id = ${recruiterId} AND c.active \
                '+
                (search ? 
                    'AND (name_search @@ to_tsquery(\'simple\', ${search}))'
                :'')+' \
                ORDER BY tag_score DESC, c.last_name ASC, c.first_name ASC \
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