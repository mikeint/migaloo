def dbscriptsPath = "C:\\Users\\marcuccm\\git\\hireRanked\\db_scripts\\"
def lines = new File("${dbscriptsPath}FakeNames.txt").readLines()
def out = new File("${dbscriptsPath}fakeData.pgsql")
def addressQuery = "INSERT INTO address (address_id, street_address_1, city, state, country, lat_lon) VALUES \n\t"
def addressData = []
def addressId = 5000
def candidateTagsQuery = "INSERT INTO candidate_tags (candidate_id, tag_id) VALUES \n\t"
def candidateTagsData = []
def candidateQuery = "INSERT INTO candidate (candidate_id, first_name, last_name, phone_number, experience_type_id, salary_type_id, address_id) VALUES \n\t"
def candidateData = []
def loginQuery = "INSERT INTO login (user_id, email, created_on, user_type_id) VALUES \n\t"
def loginData = []
def recrutierCandidateQuery = "INSERT INTO recruiter_candidate (candidate_id, recruiter_id, created_on) VALUES \n\t"
def recrutierCandidateData = []
def candidateId = 1010
def headers = lines[0].split("\t")
def recruiterCount = 3
def salaryCount = 14
def expierenceCount = 4
def tagCount = 24
// Generate Candidates 
getTags = {->(1..((Integer)(Math.random()*6+3))).collect{(Integer)(Math.random()*tagCount+1)}}
lines.drop(1).take(1000).each{line->
    line = line.replaceAll(/'/, "''")
    def d = [headers, line.split("\t")].transpose().collectEntries()
    def daysBack = (Integer)(Math.random()*45+1)
    def salary = (Integer)(Math.random()*salaryCount+1)
    def exp = (Integer)(Math.random()*expierenceCount+1)
    def recruiter = (Integer)(Math.random()*recruiterCount+1)
    def tag = getTags()
    addressData << "(${addressId}, '${d.StreetAddress}', '${d.City}', '${d.State}', '${d.Country}', point(${d.Latitude}, ${d.Longitude}))"
    loginData << "(${candidateId}, '${d.EmailAddress}', current_date - interval '${daysBack}' day, 3)"
    candidateData << "(${candidateId}, '${d.GivenName}', '${d.Surname}', '${d.TelephoneNumber}', ${exp}, ${salary}, ${addressId})"
    candidateTagsData << tag.collect{"(${candidateId}, ${it})"}.unique().join(", ")
    recrutierCandidateData << "(${candidateId}, ${recruiter}, current_date - interval '${daysBack}' day)"
    addressId++
    candidateId++
}
out.write("")
out << (loginQuery + loginData.join(",\n\t")+";\n")
out << (addressQuery + addressData.join(",\n\t")+";\n")
out << (candidateQuery + candidateData.join(",\n\t")+";\n")
out << (candidateTagsQuery + candidateTagsData.join(",\n\t")+";\n")
out << (recrutierCandidateQuery + recrutierCandidateData.join(",\n\t")+";\n")
// Generate Employers 
