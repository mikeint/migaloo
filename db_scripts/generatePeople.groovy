@Grab( 'commons-lang:commons-lang:2.6' )
import org.apache.commons.lang.StringEscapeUtils

import groovy.json.JsonSlurper
def dbscriptsPath = "C:\\Users\\marcuccm\\git\\migaloo\\db_scripts\\"
def jobTitles = new JsonSlurper().parseText(new File("${dbscriptsPath}jobTitles.json").text.replaceAll(/'/, "''"))
def jobDescriptions = new File("${dbscriptsPath}jobDescriptions.txt").readLines().collect{StringEscapeUtils.unescapeHtml(it.replaceAll(/'/, "''"))}
def lines = new File("${dbscriptsPath}FakeNames.txt").readLines()
def out = new File("${dbscriptsPath}fakeData.pgsql")
def addressQuery = "INSERT INTO address (address_id, address_line_1, city, state_province, country, lat, lon) VALUES \n\t"
def addressData = []
def addressId = 5000

def candidateTagsQuery = "INSERT INTO candidate_tags (candidate_id, tag_id) VALUES \n\t"
def candidateTagsData = []

def candidateQuery = "INSERT INTO candidate (candidate_id, first_name, last_name, phone_number, experience_years, salary, address_id) VALUES \n\t"
def candidateData = []

def loginQuery = "INSERT INTO login (user_id, email, created_on, user_type_id) VALUES \n\t"
def loginData = []

def recrutierCandidateQuery = "INSERT INTO recruiter_candidate (candidate_id, recruiter_id, created_on) VALUES \n\t"
def recrutierCandidateData = []
def candidateId = 10000

def employerQuery = "INSERT INTO company (company_id, company_name, department, address_id) VALUES \n\t"
def employerData = []
def employerId = 1000000

def employerContactQuery = "INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES \n\t"
def employerContactData = []
def employerContactId = 10000000

def jobPostingQuery = "INSERT INTO job_posting_all (post_id, company_id, address_id, created_on, title, requirements, experience_years, salary) VALUES \n\t"
def jobPostingData = []
def postId = 100

def jobRecruiterPostingQuery = "INSERT INTO job_recruiter_posting (post_id, recruiter_id) VALUES \n\t"
def jobRecruiterPostingData = []

def jobPostingTagsQuery = "INSERT INTO posting_tags (post_id, tag_id) VALUES \n\t"
def jobPostingTagsData = []

def accountManagerQuery = "INSERT INTO posting_tags (account_manager_id, first_name, last_name, phone_number) VALUES \n\t"
def accountManagerData = []

def headers = lines[0].split("\t")
def recruiterCount = 3
def salaryCount = 18
def expierenceCount = 35
def tagCount = 60
// Generate Candidates 
def getTitle = {->jobTitles[(Integer)(Math.random()*jobTitles.size())]}
def getRequirements = {->jobDescriptions[(Integer)(Math.random()*jobDescriptions.size())]}
def getTags = {->(1..((Integer)(Math.random()*6+3))).collect{(Integer)(Math.random()*tagCount+1)}}
lines.drop(1).take(1000).each{line->
    line = line.replaceAll(/'/, "''")
    def d = [headers, line.split("\t")].transpose().collectEntries()
    def daysBack = (Integer)(Math.random()*45+1)
    def salary = (Integer)(Math.random()*salaryCount+1)
    def exp = (Integer)(Math.random()*expierenceCount+1)
    def recruiter = (Integer)(Math.random()*recruiterCount+1)
    def tag = getTags()
    addressData << "(${addressId}, '${d.StreetAddress}', '${d.City}', '${d.State}', '${d.Country}', ${d.Latitude}, ${d.Longitude})"
    loginData << "(${candidateId}, '${d.EmailAddress}', current_date - interval '${daysBack}' day, 3)"
    candidateData << "(${candidateId}, '${d.GivenName}', '${d.Surname}', '${d.TelephoneNumber}', ${exp}, ${salary}, ${addressId})"
    candidateTagsData << tag.collect{"(${candidateId}, ${it})"}.unique().join(", ")
    recrutierCandidateData << "(${candidateId}, ${recruiter}, current_date - interval '${daysBack}' day)"
    addressId++
    candidateId++
}
// Generate employer
lines.drop(1001).take(1000).each{line->
    line = line.replaceAll(/'/, "''")
    def d = [headers, line.split("\t")].transpose().collectEntries()
    def daysBack = (Integer)(Math.random()*45+1)
    def salary = (Integer)(Math.random()*salaryCount+1)
    def exp = (Integer)(Math.random()*expierenceCount+1)
    def recruiter = (Integer)(Math.random()*recruiterCount+1)
    def tag = getTags()
    def title = getTitle()
    def requirements = getRequirements()
    loginData << "(${employerContactId}, '${d.EmailAddress}', current_date - interval '${daysBack}' day, 2)"
    loginData << "(${employerId}, null, current_date - interval '${daysBack}' day, 4)"
    addressData << "(${addressId}, '${d.StreetAddress}', '${d.City}', '${d.State}', '${d.Country}', ${d.Latitude}, ${d.Longitude})"
    employerData << "(${employerId}, '${d.Company}', 'Unknown', ${addressId})"
    employerContactData << "(${employerContactId}, ${employerId}, true)"
    accountManagerData << "(${employerContactId}, '${d.GivenName}', '${d.Surname}', '${d.TelephoneNumber}')"
    jobPostingData << "(${postId}, ${employerId}, ${addressId}, current_date - interval '${daysBack}' day, '${title}', '${requirements}', ${exp}, ${salary})"
    jobRecruiterPostingData << "(${postId}, ${recruiter})"
    jobPostingTagsData << tag.collect{"(${postId}, ${it})"}.unique().join(", ")
    addressId++
    employerContactId++
    employerId++
    postId++
}
out.write("")
out << (loginQuery + loginData.join(",\n\t")+";\n")
out << (addressQuery + addressData.join(",\n\t")+";\n")
out << (candidateQuery + candidateData.join(",\n\t")+";\n")
out << (candidateTagsQuery + candidateTagsData.join(",\n\t")+";\n")
out << (recrutierCandidateQuery + recrutierCandidateData.join(",\n\t")+";\n")
out << (employerQuery + employerData.join(",\n\t")+";\n")
out << (employerContactQuery + employerContactData.join(",\n\t")+";\n")
out << (jobPostingQuery + jobPostingData.join(",\n\t")+";\n")
out << (jobPostingTagsQuery + jobPostingTagsData.join(",\n\t")+";\n")
// Generate Employers 