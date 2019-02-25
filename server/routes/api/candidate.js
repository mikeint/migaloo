const express = require('express');
const router = express.Router();
const passport = require('../../config/passport');
const moment = require('moment');
const validateCandidateInput = require('../../validation/candidate');  

const db = require('../../config/db')
const postgresdb = db.postgresdb
const pgp = db.pgp
const candidateTagsInsertHelper = new pgp.helpers.ColumnSet(['candidate_id', 'tag_id'], {table: 'candidate_tags'});


/**
 * Create a new candidate for the recruiter
 * @route POST api/candidate/create
 * @group candidate - Job postings for employers
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
        return res.status(400).json(errors);
    }
    var jwtPayload = body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be an recruiter to add a candidate"})
    }

    postgresdb.tx(t => {
        // creating a sequence of transaction queries:
        const q1 = t.one('INSERT INTO candidate (first_name, last_name, email, experience_type_id, salary_type_id) VALUES ($1, $2, $3, $4, $5) RETURNING candidate_id',
                            [body.firstName, body.lastName, body.email, body.experienceTypeId, body.salaryTypeId])
        return q1.then((candidate_ret)=>{
            const q2 = t.none('INSERT INTO recruiter_candidate (candidate_id, recruiter_id) VALUES ($1, $2)',
                                [candidate_ret.candidate_id, jwtPayload.id])
            var queries = [q2];
            if(body.tagIds != null && body.tagIds.length > 0){
                const query = pgp.helpers.insert(body.tagIds.map(d=>{return {candidate_id: candidate_ret.candidate_id, tag_id: d}}), candidateTagsInsertHelper);
                const q3 = t.none(query);
                queries.push(q3)
            }
            return t.batch(queries).then(()=>{
                res.json({success: true})
            })
            .catch(err => {
                console.log(err)
                res.status(400).json({success: false, error:err})
            });
            
        })
        .catch(err => {
            
            console.log(err)
            res.status(400).json({success: false, error:err})
        });
    })
    .then(() => {
        console.log("Done TX")
    }).catch((err)=>{
        console.log(err)
        return res.status(500).json({success: false, error:err})
    });
});

// @route       GET api/candidate/lisy
// @desc        List all candidates for a recruiter
// @access      Private
router.get('/list', passport.authentication, listCandidates);
router.get('/list/:page', passport.authentication, listCandidates);
function listCandidates(req, res){
    var page = req.params.page;
    if(page == null)
        page = 1;
    var jwtPayload = req.body.jwtPayload;
    if(jwtPayload.userType != 1){
        return res.status(400).json({success:false, error:"Must be an recruiter to look at canidates"})
    }

    postgresdb.any(' \
        SELECT c.candidate_id, c.first_name, c.last_name, c.email, c.created_on, c.resume_id, \
            coalesce(cpd.posted_count, 0) as posted_count, coalesce(cpd.accepted_count, 0) as accepted_count, \
            coalesce(cpd.not_accepted_count, 0) as not_accepted_count, coalesce(cpd.coins_spent, 0) as coins_spent, \
            coalesce(cpd.new_accepted_count, 0) as new_accepted_count, coalesce(cpd.new_not_accepted_count, 0) as new_not_accepted_count, \
            (count(1) OVER())/10+1 AS page_count \
        FROM recruiter_candidate rc \
        INNER JOIN candidate c ON c.candidate_id = rc.candidate_id \
        LEFT JOIN ( \
            SELECT cp.candidate_id, \
                SUM(1) as posted_count, \
                SUM(cast(accepted as int)) as accepted_count, \
                SUM(cast(not_accepted as int)) as not_accepted_count, \
                SUM(coins) as coins_spent, \
                SUM(CASE WHEN NOT has_seen_response AND accepted THEN 1 ELSE 0 END) as new_accepted_count, \
                SUM(CASE WHEN NOT has_seen_response AND not_accepted THEN 1 ELSE 0 END) as new_not_accepted_count \
            FROM candidate_posting cp\
            WHERE cp.recruiter_id = $1 \
            GROUP BY cp.candidate_id \
        ) cpd ON cpd.candidate_id = c.candidate_id\
        WHERE rc.recruiter_id = $1 AND c.active \
        ORDER BY c.last_name ASC \
        OFFSET $1 \
        LIMIT 10', [jwtPayload.id, (page-1)*10])
    .then((data) => {
        // Marshal data
        data = data.map(m=>{
            var timestamp = moment(m.created_on);
            var ms = timestamp.diff(moment());
            m.created = moment.duration(ms).humanize() + " ago";
            m.created_on = timestamp.format("x");
            return m
        })
        res.json(data)
    })
    .catch(err => {
        console.log(err)
        res.status(400).json(err)
    });
}

module.exports = router;