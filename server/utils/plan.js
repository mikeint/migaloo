const db = require('../utils/db');
const notifications = require('./notifications');
const logger = require('../utils/logging');

const postgresdb = db.postgresdb
const pgp = db.pgp

// Todo: Add notifications
function updatePlan(companyId, salary){
    if(salary == null){
        const errorMessage = "Missing salary"
        logger.error('Route Params Mismatch', {tags:['validation'], body:{companyId:companyId, salary:salary}, error:errorMessage});
        throw new Error(`Invalid Plan Type Id '${planData.planTypeId}'`)
    }
    /**
     * Update the plan based on the type using either the number of positions or salary
     * This function assumes one position per call
     */
    return postgresdb.one('\
        SELECT * \
        FROM plan p \
        WHERE p.company_id = ${companyId}', {companyId:companyId})
        .then((planData)=>{
            planData = db.camelizeFields(planData)
            if(planData.planTypeId === 1){ // On Demand
                logger.info('Plan Updated', {tags:['sql'], type: 'On Demand', ...planData, salaryOfCandidate: salary})
                return postgresdb.none('UPDATE plan p SET positions_filled=p.positions_filled + 1, salary_filled=p.salary_filled + ${salary} \
                    WHERE p.plan_id = ${planId}', {planId: planData.planId, salary: salary})
            }
            else if(planData.planTypeId === 2){ // Salary Based Subscription
                logger.info('Plan Updated', {tags:['sql'], type: 'Salary Based Subscription', ...planData, salaryOfCandidate: salary})
                return postgresdb.none('UPDATE plan p SET positions_filled=p.positions_filled + 1, salary_filled=p.salary_filled + ${salary}, \
                    subscription_remaining=p.subscription_remaining - ${salary}\
                    WHERE p.plan_id = ${planId}', {planId: planData.planId, salary: salary})
            }
            else if(planData.planTypeId === 3){ // Position Based Subscription
                logger.info('Plan Updated', {tags:['sql'], type: 'Position Based Subscription', ...planData, salaryOfCandidate: salary})
                return postgresdb.none('UPDATE plan p SET positions_filled=p.positions_filled + 1, salary_filled=p.salary_filled + ${salary}, \
                    subscription_remaining=p.subscription_remaining - 1\
                    WHERE p.plan_id = ${planId}', {planId: planData.planId, salary: salary})
            }
            else{
                throw new Error(`Invalid Plan Type Id '${planData.planTypeId}'`)
            }
        })
        .catch(err => {
            logger.error('Plan Update SQL Call Failed', {tags:['sql'], error:err.message || err, body:{companyId:companyId, salary:salary}});
            return Promise.reject()
        });
}

module.exports = {
    updatePlan:updatePlan
};