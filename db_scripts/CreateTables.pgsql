DROP VIEW IF EXISTS user_master;
DROP TABLE IF EXISTS rate_employer;
DROP TABLE IF EXISTS rate_recruiter;
DROP TABLE IF EXISTS rate_candidate;
DROP VIEW IF EXISTS messages;
DROP FUNCTION IF EXISTS messages_InsteadOfInsert_pr;
DROP TABLE IF EXISTS messages_chat;
DROP TABLE IF EXISTS messages_calander;
DROP TABLE IF EXISTS messages_base;
DROP TABLE IF EXISTS messages_subject;
DROP TABLE IF EXISTS messages_type;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS posting_tags;
DROP TABLE IF EXISTS candidate_tags;
DROP TABLE IF EXISTS recruiter_candidate;
DROP TABLE IF EXISTS candidate_posting;
DROP TABLE IF EXISTS job_posting_contact;
DROP TABLE IF EXISTS job_posting;
DROP TABLE IF EXISTS recruiter;
DROP TABLE IF EXISTS candidate;
DROP TABLE IF EXISTS employer_contact;
DROP TABLE IF EXISTS employer;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS user_type;
DROP TABLE IF EXISTS salary_type;
DROP TABLE IF EXISTS experience_type;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS location_type;

CREATE TABLE user_type (
    user_type_id serial,
    user_type_name varchar(128) NOT NULL,
    PRIMARY KEY(user_type_id)
);
CREATE TABLE experience_type (
    experience_type_id serial,
    experience_type_name varchar(128) NOT NULL,
    PRIMARY KEY(experience_type_id)
);
CREATE TABLE salary_type (
    salary_type_id serial,
    salary_type_name varchar(128) NOT NULL,
    PRIMARY KEY(salary_type_id)
);
CREATE TABLE login (
    user_id bigserial,
    email varchar(128) UNIQUE,
    passwordhash varchar(128),
    created_on timestamp default NOW(),
    last_login timestamp,
    user_type_id int REFERENCES user_type(user_type_id),
    PRIMARY KEY(user_id)
);
CREATE UNIQUE INDEX login_lower_idx ON login ((lower(email)));
CREATE TABLE address (
    address_id bigserial,
    street_address_1 varchar(128),
    street_address_2 varchar(128),
    city varchar(128),
    state varchar(128),
    country varchar(128),
    lat_lon point,
    PRIMARY KEY(address_id)
);
CREATE TABLE employer (
    employer_id bigserial REFERENCES login(user_id),
    address_id bigint REFERENCES address(address_id),
    company_name  varchar(128) NULL,
    company_name_search tsvector,
    image_id varchar(128),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(employer_id)
);
CREATE INDEX employer_active_idx ON employer(active);
CREATE INDEX employer_tsv_idx ON employer USING gin(company_name_search);
CREATE TRIGGER employer_search_vector_update
BEFORE INSERT OR UPDATE
ON employer
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (company_name_search, 'pg_catalog.simple', company_name);

CREATE TABLE rate_employer (
    employer_id bigint REFERENCES employer(employer_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(employer_id, user_id)
);
CREATE TABLE employer_contact (
    employer_id bigint REFERENCES employer(employer_id),
    employer_contact_id bigint REFERENCES login(user_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    image_id varchar(128),
    active boolean default true,
    isAdmin boolean default false,
    name_search tsvector,
    PRIMARY KEY(employer_contact_id)
);
CREATE INDEX employer_contact_order_idx ON employer_contact(last_name ASC, first_name ASC);
CREATE INDEX employer_contact_active_idx ON employer_contact(active);
CREATE INDEX employer_contact_tsv_idx ON employer_contact USING gin(name_search);
CREATE TRIGGER employer_contact_search_vector_update
BEFORE INSERT OR UPDATE
ON employer_contact
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (name_search, 'pg_catalog.simple', last_name, first_name);

CREATE TABLE recruiter (
    recruiter_id bigint REFERENCES login(user_id),
    address_id bigint REFERENCES address(address_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    coins int DEFAULT 0 NOT NULL CHECK (coins >= 0),
    image_id varchar(128),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE rate_recruiter (
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(recruiter_id, user_id)
);
CREATE TABLE job_posting (
    post_id bigserial,
    employer_id bigint REFERENCES employer(employer_id),
    salary_type_id int REFERENCES salary_type(salary_type_id),
    title varchar(255) NOT NULL,
    caption text NOT NULL,
	created_on timestamp default NOW(),
    experience_type_id int REFERENCES experience_type(experience_type_id),
    active boolean default true,
    PRIMARY KEY(post_id)
);
CREATE INDEX job_posting_active_idx ON job_posting(active);
CREATE TABLE job_posting_contact (
    post_id bigint REFERENCES job_posting(post_id),
    employer_contact_id bigint REFERENCES employer_contact(employer_contact_id),
    PRIMARY KEY(post_id)
);
CREATE TABLE candidate (
    candidate_id bigint REFERENCES login(user_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    resume_id varchar(128),
    phone_number  varchar(32) NULL,
    salary_type_id int REFERENCES salary_type(salary_type_id),
    experience_type_id int REFERENCES experience_type(experience_type_id),
    active boolean default true,
    rating float default null,
    address_id bigint REFERENCES address(address_id),
    name_search tsvector,
    PRIMARY KEY(candidate_id)
);
CREATE INDEX candidate_order_idx ON candidate(last_name ASC, first_name ASC);
CREATE INDEX candidate_active_idx ON candidate(active);
CREATE INDEX candidate_tsv_idx ON candidate USING gin(name_search);
CREATE TRIGGER candidate_search_vector_update
BEFORE INSERT OR UPDATE
ON candidate
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (name_search, 'pg_catalog.simple', last_name, first_name);

CREATE TABLE rate_candidate (
    candidate_id bigint REFERENCES candidate(candidate_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(candidate_id, user_id)
);
CREATE TABLE recruiter_candidate (
    candidate_id bigint REFERENCES candidate(candidate_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
	created_on timestamp default NOW(),
    PRIMARY KEY(candidate_id, recruiter_id)
);
CREATE TABLE candidate_posting (
    candidate_id bigint REFERENCES candidate(candidate_id),
    post_id bigint REFERENCES job_posting(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    created_on timestamp default NOW(),
    responded_on timestamp,
    accepted boolean default false,
    not_accepted boolean default false,
    has_seen_post boolean default false,
    has_seen_response boolean default false,
    comment varchar(512),
    coins int NOT NULL CHECK (coins > 0),
    PRIMARY KEY(candidate_id, post_id, recruiter_id)
);
CREATE INDEX candidate_posting_idx ON candidate_posting(post_id, recruiter_id);
CREATE INDEX candidate_posting_cdt_idx ON candidate_posting(candidate_id);
CREATE TABLE messages_type (
    message_type_id serial,
    message_type_name varchar(50) NOT NULL,
    PRIMARY KEY(message_type_id)
);
CREATE TABLE location_type (
    location_type_id serial,
    location_type_name varchar(50) NOT NULL,
    PRIMARY KEY(location_type_id)
);
CREATE TABLE messages_subject (
    message_subject_id bigserial,
    user_id_1 bigint REFERENCES login(user_id) NOT NULL,
    user_id_2 bigint REFERENCES login(user_id) NOT NULL,
    created_on timestamp default NOW(),
    subject_user_id bigint REFERENCES login(user_id),
    post_id bigint REFERENCES job_posting(post_id),
    unique (user_id_1, user_id_2, subject_user_id, post_id),
    PRIMARY KEY(message_subject_id)
);
CREATE TABLE messages_base (
    message_id bigserial,
    message_type_id int REFERENCES messages_type(message_type_id) NOT NULL,
    message_subject_id bigint REFERENCES messages_subject(message_subject_id) NOT NULL,
    to_id bigint REFERENCES login(user_id) NOT NULL,
    created_on timestamp default NOW(),
    has_seen boolean default false,
    PRIMARY KEY(message_id)
);
CREATE TABLE messages_chat (
    message_id_chat bigint references messages_base(message_id) not null,
    message text NOT NULL,
    PRIMARY KEY(message_id_chat)
);
CREATE TABLE messages_calander (
    message_id_calander bigint references messages_base(message_id) not null,
    date_offer timestamp not null,
    minute_length smallint not null,
    location_type integer references location_type(location_type_id) not null,
    responded boolean default false,
    response smallint default 0,
    PRIMARY KEY(message_id_calander)
);
CREATE VIEW messages AS 
SELECT mb.*, ct.*, cl.*, lt.*, ms.user_id_1, ms.user_id_2, ms.post_id, ms.subject_user_id
FROM messages_base mb
LEFT JOIN messages_chat ct ON ct.message_id_chat = mb.message_id
LEFT JOIN messages_calander cl ON cl.message_id_calander = mb.message_id
LEFT JOIN location_type lt ON cl.location_type = lt.location_type_id
LEFT JOIN messages_subject ms ON ms.message_subject_id = mb.message_subject_id;

CREATE FUNCTION messages_InsteadOfInsert_pr() RETURNS trigger AS $$
DECLARE 
    MessageID bigint;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.created_on is NULL) THEN
            NEW.created_on = CURRENT_DATE;
        END IF;
        Insert into messages_base(message_type_id, to_id, message_subject_id, created_on) VALUES (
            NEW.message_type_id,
            NEW.to_id, NEW.message_subject_id, NEW.created_on)
        RETURNING message_id into MessageID;

        IF (NEW.message_type_id = 1) THEN -- Chat
            Insert into messages_chat(message_id_chat, message)
            VALUES (MessageID, NEW.message);
        ELSIF (NEW.message_type_id = 2) THEN -- Calander
            Insert into messages_calander(message_id_calander, date_offer, minute_length, location_type)
            VALUES (MessageID, NEW.date_offer, NEW.minute_length, NEW.location_type);
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.has_seen is not null) THEN -- Chat
            UPDATE messages_base SET has_seen = NEW.has_seen WHERE message_id = NEW.message_id;
        END IF;
        
        IF (NEW.message_type_id = 2 AND NEW.response is not null) THEN -- Calander
            UPDATE messages_calander
            SET responded = true, response = NEW.response
            WHERE message_id_calander = NEW.message_id;

            Insert into messages_base(message_type_id, to_id, message_subject_id, created_on)
                SELECT message_type_id, to_id, message_subject_id, created_on - interval '1' second as created_on
                FROM messages_base
                WHERE message_id = NEW.message_id
            RETURNING message_id into MessageID;

            Insert into messages_calander(message_id_calander, date_offer, minute_length, location_type, response)
                SELECT MessageID, date_offer, minute_length, location_type, NEW.response
                FROM messages_calander
                WHERE message_id_calander = NEW.message_id;
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE PLPGSQL;

Create trigger messages_InsteadOfInsert_pr
Instead Of Insert or Update
on messages
FOR EACH ROW
EXECUTE PROCEDURE messages_InsteadOfInsert_pr();

CREATE INDEX message_chain_idx ON messages_subject(user_id_1, user_id_2);
CREATE INDEX message_chain_subject_idx ON messages_subject(user_id_1, user_id_2, message_subject_id);
CREATE INDEX message_to_idx ON messages_base(to_id);


CREATE TABLE transactions (
    transaction_id bigserial,
    created_on timestamp default NOW(),
    coins int NOT NULL,
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    PRIMARY KEY(recruiter_id)
);
CREATE TABLE tags (
    tag_id bigserial,
    tag_name varchar(64) NOT NULL,
    PRIMARY KEY(tag_id)
);
CREATE UNIQUE INDEX tag_name_lower_idx ON tags ((lower(tag_name)));

CREATE TABLE posting_tags (
    post_id bigint REFERENCES job_posting(post_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(post_id, tag_id)
);
CREATE INDEX posting_tags_idx ON posting_tags(tag_id);

CREATE TABLE candidate_tags (
    candidate_id bigint REFERENCES candidate(candidate_id),
    tag_id bigint REFERENCES tags(tag_id),
    PRIMARY KEY(candidate_id, tag_id)
);
CREATE INDEX candidate_tags_idx ON candidate_tags(tag_id);

CREATE VIEW user_master AS 
SELECT 
    l.created_on, l.user_id, l.user_type_id, l.last_login, l.email, ut.user_type_name, ec.employer_id,
    coalesce(c.first_name, r.first_name, ec.first_name) as first_name,
    coalesce(e.company_name, eec.company_name) as company_name,
    coalesce(c.last_name, r.last_name, ec.last_name) as last_name,
    coalesce(c.phone_number, r.phone_number, ec.phone_number) as phone_number,
    coalesce(c.rating, r.rating, e.rating) as rating,
    coalesce(c.active, r.active, ec.active) as active
FROM login l
INNER JOIN user_type ut ON ut.user_type_id = l.user_type_id
LEFT JOIN candidate c ON c.candidate_id = l.user_id
LEFT JOIN recruiter r ON r.recruiter_id = l.user_id
LEFT JOIN employer e ON e.employer_id = l.user_id
LEFT JOIN employer_contact ec ON ec.employer_contact_id = l.user_id
LEFT JOIN employer eec ON eec.employer_id = ec.employer_id;

-- DATA START
INSERT INTO messages_type (message_type_id, message_type_name) VALUES
    (1, 'Chat'),
    (2, 'Calander');
INSERT INTO location_type (location_type_id, location_type_name) VALUES
    (1, 'Phone'),
    (2, 'In-Person');
INSERT INTO user_type (user_type_name) VALUES
    ('Recruiter'),
    ('Employer Contact'),
    ('Candidate'),
    ('Employer');
INSERT INTO experience_type (experience_type_name) VALUES 
    ('Entry Level'),
    ('Mid Level'),
    ('Senior Level'),
    ('Executive Level');
INSERT INTO salary_type (salary_type_name) VALUES 
    ('0k - 15k'),
    ('15k - 30k'),
    ('30k - 45k'),
    ('45k - 60k'),
    ('60k - 75k'),
    ('75k - 100k'),
    ('100k - 125k'),
    ('125k - 150k'),
    ('150k - 175k'),
    ('175k - 200k'),
    ('200k - 250k'),
    ('250k - 300k'),
    ('300k - 350k'),
    ('350k+');
INSERT INTO tags (tag_name) VALUES
    ('SQL'),
    ('PostgreSQL'),
    ('C++'),
    ('C#'),
    ('C'),
    ('Java'),
    ('Scrum'),
    ('Cobol'),
    ('Javascript'),
    ('Python'),
    ('Analytics'),
    ('R'),
    ('RAPID'),
    ('Scala'),
    ('Linux'),
    ('Windows'),
    ('Excel'),
    ('Bash'),
    ('Redhat'),
    ('.NET'),
    ('Architecture Design'),
    ('Project Management'),
    ('Leadership'),
    ('Agile');
-- FAKE DATA START
INSERT INTO login (user_id, email, passwordhash, created_on, user_type_id) VALUES 
    (1, 'r1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-17 10:23:54', 1), -- Add Recruiter, pass: test
    (2, 'r2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-11-25 10:23:54', 1), -- Add Recruiter, pass: test
    (3, 'r3@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-12-25 10:23:54', 1), -- Add Recruiter, pass: test
    (100, 'e1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-01-21 10:23:54', 2), -- Add Employer, pass: test
    (101, 'e2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (102, 'e3@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (103, 'e4@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (104, 'e5@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (105, 'e6@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (106, 'e7@test.com', NULL, TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (500, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (501, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4); -- Dummy Employer, pass: test
INSERT INTO login (user_id, email, created_on, user_type_id) VALUES 
    (1000, 'c1@test.com', TIMESTAMP '2019-02-17 10:23:54', 3), -- Add candidate
    (1001, 'c2@test.com', TIMESTAMP '2018-11-25 10:23:54', 3), -- Add candidate
    (1002, 'c3@test.com', TIMESTAMP '2018-12-25 10:23:54', 3), -- Add candidate
    (1003, 'c4@test.com', TIMESTAMP '2019-01-21 10:23:54', 3), -- Add candidate
    (1004, 'c5@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1005, 'c6@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1006, 'c7@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1007, 'c8@test.com', TIMESTAMP '2019-02-20 10:23:54', 3); -- Add candidate
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('123 Main St.', 'Toronto', 'ON', 'CA', point(43.6531, -79.3831));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('4312 Dundas Rd.', 'Toronto', 'ON', 'CA', point(43.6533, -79.3833));
INSERT INTO address (street_address_1, city, state, country, lat_lon) VALUES ('21 Backersfield Rd.', 'North York', 'ON', 'CA', point(43.65335, -79.38325));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('654 York Rd.', 'Suite 203', 'Toronto', 'ON', 'CA', point(43.65325, -79.38312));
INSERT INTO address (street_address_1, street_address_2, city, state, country, lat_lon) VALUES ('1325 York Rd.', 'Building 3', 'Toronto', 'ON', 'CA', point(43.65324, -79.38328));
INSERT INTO employer (employer_id, company_name, address_id) VALUES
    (500, 'Google Inc.', 1), 
    (501, 'Microsoft Inc.', 2);
INSERT INTO employer_contact (employer_contact_id, employer_id, first_name, last_name, phone_number, isAdmin) VALUES
    (100, 500, 'Steve', 'Smith', '905-555-8942', true), 
    (101, 501, 'Jerry', 'McGuire', '905-555-0425', true),
    (102, 500, 'Tom', 'McInly', '905-555-7624', false),
    (103, 500, 'Arnold', 'Stone', '905-555-0786', false),
    (104, 500, 'Adam', 'Steal', '905-555-9782', false),
    (105, 500, 'Kelly', 'Rogers', '905-555-6456', false),
    (106, 500, 'Rebecca', 'Brown', NULL, false);
INSERT INTO recruiter (recruiter_id, first_name, last_name, phone_number, coins, address_id) VALUES
    (1, 'John', 'Macabee', '443-555-8234', 25, 3),
    (2, 'Milton', 'Walker', '443-555-6456', 50, 4),
    (3, 'Jill', 'Stein', '443-555-3453', 32, 5);
INSERT INTO candidate (candidate_id, first_name, last_name, experience_type_id, salary_type_id) VALUES
    (1000, 'Sarah', 'Williams', 3, 6),
    (1001, 'Amanda', 'Taylor', 2, 5),
    (1002, 'Elizabeth ', 'Blaese', 2, 5),
    (1003, 'Stephanie', 'Kim', 2, 5),
    (1004, 'Nicholas ', 'Diaz', 3, 7),
    (1005, 'Anton', 'Moore', 3, 6),
    (1006, 'Chris', 'Roth', 2, 5),
    (1007, 'Lukas', 'Page', 1, 4);
INSERT INTO recruiter_candidate (candidate_id, recruiter_id, created_on) VALUES
    (1000, 1, current_date - interval '1' day),
    (1001, 1, current_date - interval '2' day),
    (1001, 2, current_date - interval '2' day),
    (1002, 3, current_date - interval '3' day),
    (1003, 1, current_date - interval '4' day),
    (1004, 1, current_date - interval '5' day),
    (1005, 1, current_date - interval '6' day),
    (1005, 2, current_date - interval '6' day),
    (1006, 3, current_date - interval '7' day),
    (1007, 1, current_date - interval '8' day),
    (1007, 2, current_date - interval '8' day),
    (1007, 3, current_date - interval '8' day);
INSERT INTO job_posting (post_id, employer_id, created_on, title, caption, experience_type_id, salary_type_id) VALUES
    (1, 500, current_date - interval '5' minute, 'Senior Software Developer - Working on exciting projects', 'We are a small company that develops solutions to protect national security and everyday folks. That includes OS integration, programming in C, C++, Java, Scala, Python, JS, or whatever the job calls for, writing security policies, and everything in between.', 2, 4),
    (2, 501, current_date - interval '1' hour, 'Software Developer', 'As a software developer, you will be a key individual contributor on a sprint team building the future software at the core of the business. The role is for a full stack developer with the ability to develop solutions for the user interface, business logic, persistence layer and data store. Developers are responsible for implementing well-defined requirements as part of the sprint team including unit tests.', null, 5),
    (3, 500, current_date - interval '3' hour, 'Director of Technical Support', 'As Director of Technical Support for Tenable, you will provide strategic direction, leadership, development and management with our Americas Technical Support team. The Director of Technical Support is an experienced, enthusiastic, hands-on leader focused on building a world class Technical Support organization that is focused on delivering customer success. You will be the conduit between the Technical Support team, Customer Success Management team, Product and Development teams, and other internal stakeholders developing a trusted advisor relationship that enables rapid, focused, resolution for our customers. To be successful in this role, the Director of Technical Support must have the right combination of strategy, leadership and operational skills to manage a growing team of dedicated Technical Support Engineers.', 3, 6),
    (4, 501, current_date - interval '1' day, 'IT Director', 'The primary directive of the IT Director is to ensure that the technology and computing needs of the company are met. The candidate will work with executive leadership to help develop and maintain an IT roadmap keeping the company�s future objectives in mind. This position requires significant hands-on technical knowledge and expertise coupled with solid business knowledge. The IT Director must be able to collaborate with internal customers to identify and prioritize business requirements and deliver business and technology solutions with a focus on process transformation from planning through implementation. They will support the organizational initiative of process re-engineering by involving client departments in process flow analysis and work re-design. ', 3, 7);

INSERT INTO job_posting_contact (post_id, employer_contact_id) VALUES
    (1, 100),
    (2, 101),
    (3, 100),
    (4, 101);

INSERT INTO candidate_posting (post_id, candidate_id, recruiter_id, coins, created_on, responded_on, has_seen_post, has_seen_response, accepted, not_accepted, comment) VALUES
    (1, 1000, 1, 10, current_date - interval '1' day, current_date - interval '0' day, true, false, true, false, 'I think this Sarah would be great for the job'),
    (1, 1001, 2, 5, current_date - interval '2' day, current_date - interval '1' day, true, false, false, true, 'Amanda has all of the skills you need'),
    (1, 1002, 3, 1, current_date - interval '1' day, NULL, false, false, false, false, 'Beth is very respectable and I think she will be a great addition to your team'),
    (2, 1003, 1, 2, current_date - interval '3' day, current_date - interval '2' day, true, true, true, false, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (2, 1004, 1, 20, current_date - interval '4' day, current_date - interval '3' day, true, false, true, false, null),
    (2, 1005, 2, 30, current_date - interval '2', NULL, false, false, false, false, null),
    (3, 1006, 3, 6, current_date - interval '5' day, current_date - interval '4' day, true, true, true, false, null),
    (3, 1007, 1, 7, current_date - interval '3' day, current_date - interval '1' day, true, false, false, true, null),
    (3, 1000, 1, 4, current_date - interval '2' day, NULL, false, false, false, false, 'I think this Sarah would be great for the job'),
    (3, 1001, 2, 4, current_date - interval '1' day, current_date - interval '0' day, true, true, true, false, 'Amanda has all of the skills you need'),
    (4, 1002, 3, 20, current_date - interval '3' day, current_date - interval '2' day, true, false, false, true, 'Beth is very respectable and I think she will be a great addition to your team'),
    (4, 1003, 1, 9, current_date - interval '4' day, current_date - interval '3' day, true, true, true, false, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (4, 1004, 1, 8, current_date - interval '5' day, current_date - interval '4' day, true, false, false, true, null),
    (4, 1000, 1, 1, current_date - interval '2' day, NULL, false, false, false, false, 'I think this Sarah would be great for the position you have open');
INSERT INTO posting_tags (post_id, tag_id) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (1, 4),
    (1, 5),
    (2, 1),
    (2, 3),
    (2, 4),
    (3, 4),
    (3, 5),
    (4, 4);
INSERT INTO candidate_tags (candidate_id, tag_id) VALUES
    (1000, 1),
    (1000, 4),
    (1000, 5),
    (1001, 2),
    (1001, 5),
    (1001, 3),
    (1002, 3),
    (1002, 4),
    (1002, 1),
    (1003, 1),
    (1003, 3),
    (1003, 4),
    (1004, 2),
    (1004, 5),
    (1005, 1),
    (1005, 2),
    (1005, 3),
    (1005, 4),
    (1006, 1),
    (1006, 2),
    (1006, 3),
    (1007, 3),
    (1007, 4),
    (1007, 5);
INSERT INTO messages_subject(user_id_1, user_id_2, subject_user_id, post_id, created_on) VALUES
    (1, 500, 1000, 1, current_date - interval '7' day), -- message_subject_id = 1
    (3, 500, 1006, 3, current_date - interval '11' day), -- message_subject_id = 2
    (1, 500, 1001, 1, current_date - interval '1' day); -- message_subject_id = 3
INSERT INTO messages (message_type_id, to_id, message_subject_id, message, created_on) VALUES
    (1, 1, 1, 'We would like to hear more about sarah.', current_date - interval '6' day),
    (1, 500, 1, 'She is a really excellent candidate, she has a lot of expierence as a senior software developer and has run many teams, including a 30 person team in her last job.', current_date - interval '5' day),
    (1, 1, 1, 'That sounds great lets have a call tommorow for a follow-up, I will send two meeting requests, let me know what works.', current_date - interval '4' day),
    (1, 1, 1, 'One more follow up.', current_date - interval '2.2' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '10' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '9' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '8' day),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', current_date - interval '7' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '6' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '5' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '4' day),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', current_date - interval '3' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '2' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '1' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '12' hour),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', current_date - interval '11' hour),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', current_date - interval '10' hour),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', current_date - interval '9' hour),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', current_date - interval '8' hour),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', current_date - interval '7' hour);
INSERT INTO messages (message_type_id, user_id_1, user_id_2, to_id, message_subject_id, date_offer, minute_length, location_type, created_on) VALUES
    (2, 1, 500, 1, 1, current_date - interval '63' hour, 30, 1, current_date - interval '72' hour),
    (2, 1, 500, 1, 1, current_date - interval '60' hour, 30, 1, current_date - interval '72' hour),
    (2, 1, 500, 1, 1, current_date + interval '12' hour, 60, 1, current_date - interval '48' hour);
UPDATE messages SET response = 1 WHERE message_id = 21;
UPDATE messages SET response = 2 WHERE message_id = 22;
