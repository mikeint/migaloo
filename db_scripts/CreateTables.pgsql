DROP TABLE IF EXISTS job_posting_contact; -- To Remove
DROP TABLE IF EXISTS rate_employer; -- To Remove
DROP TABLE IF EXISTS employer_contact; -- To Remove

DROP VIEW IF EXISTS user_master;
DROP TABLE IF EXISTS rate_company;
DROP TABLE IF EXISTS rate_recruiter;
DROP TABLE IF EXISTS rate_candidate;
DROP VIEW IF EXISTS messages;
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
DROP TABLE IF EXISTS denial_reason;
DROP VIEW IF EXISTS job_posting;
DROP TABLE IF EXISTS job_recruiter_posting;
DROP TABLE IF EXISTS job_posting; -- To Remove
DROP TABLE IF EXISTS job_posting_all;
DROP TABLE IF EXISTS company_contact;
DROP TABLE IF EXISTS company;
DROP TABLE IF EXISTS recruiter;
DROP TABLE IF EXISTS candidate;
DROP TABLE IF EXISTS account_manager;
DROP TABLE IF EXISTS employer; -- To Remove
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS login;
DROP TABLE IF EXISTS user_type;
DROP TABLE IF EXISTS salary_type;
DROP TABLE IF EXISTS experience_type;
DROP TABLE IF EXISTS tags_equality;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS tag_type;
DROP TABLE IF EXISTS location_type;


CREATE OR REPLACE FUNCTION array_intersects(a1 bigint[], a2 bigint[]) returns boolean as $$
declare
    ret boolean;
BEGIN
    -- The reason for the kludgy NULL handling comes later.
    if a1 is null then
        return false;
    elseif a2 is null then
        return false;
    end if;
    select min(e) is not null into ret
    from (
        select unnest(a1)
        intersect
        select unnest(a2)
    ) as dt(e);
    return ret;
END;
$$ language plpgsql;

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
    address_line_1 varchar(128),
    address_line_2 varchar(128),
    place_id varchar(128),
    city varchar(128),
    state varchar(128),
    state_code varchar(3),
    country varchar(128),
    country_code varchar(3),
    lat float,
    lon float,
    PRIMARY KEY(address_id)
);

CREATE TABLE company (
    company_id bigserial REFERENCES login(user_id),
    address_id bigint REFERENCES address(address_id),
    company_name  varchar(128) NOT NULL,
    department  varchar(128),
    company_name_search tsvector,
    image_id varchar(128),
    active boolean default true,
    rating float default null,
    PRIMARY KEY(company_id)
);
CREATE INDEX company_active_idx ON company(active);
CREATE INDEX company_tsv_idx ON company USING gin(company_name_search);
CREATE TRIGGER company_search_vector_update
BEFORE INSERT OR UPDATE
ON company
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (company_name_search, 'pg_catalog.simple', company_name);

CREATE TABLE rate_company (
    company_id bigint REFERENCES company(company_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(company_id, user_id)
);
CREATE TABLE account_manager (
    account_manager_id bigint REFERENCES login(user_id),
    first_name varchar(128) NOT NULL,
    last_name varchar(128) NOT NULL,
    phone_number  varchar(32) NULL,
    image_id varchar(128),
    active boolean default true,
    address_id bigint REFERENCES address(address_id),
    name_search tsvector,
    PRIMARY KEY(account_manager_id)
);
CREATE INDEX account_manager_order_idx ON account_manager(last_name ASC, first_name ASC);
CREATE INDEX account_manager_active_idx ON account_manager(active);
CREATE INDEX account_manager_tsv_idx ON account_manager USING gin(name_search);
CREATE TRIGGER account_manager_search_vector_update
BEFORE INSERT OR UPDATE
ON account_manager
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (name_search, 'pg_catalog.simple', last_name, first_name);

CREATE TABLE company_contact (
    company_id bigint REFERENCES company(company_id),
    company_contact_id bigint REFERENCES login(user_id),
    is_primary boolean default false,
    PRIMARY KEY(company_id, company_contact_id)
);
CREATE INDEX company_contact_active_idx ON company_contact(company_contact_id);

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
    name_search tsvector,
    PRIMARY KEY(recruiter_id)
);
CREATE INDEX recruiter_tsv_idx ON recruiter USING gin(name_search);
CREATE TRIGGER recruiter_search_vector_update
BEFORE INSERT OR UPDATE
ON recruiter
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (name_search, 'pg_catalog.simple', last_name, first_name);

CREATE TABLE rate_recruiter (
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    user_id bigint REFERENCES login(user_id),
    rating int NOT NULL,
    PRIMARY KEY(recruiter_id, user_id)
);
CREATE TABLE job_posting_all (
    post_id bigserial,
    company_id bigint REFERENCES company(company_id),
    salary_type_id int REFERENCES salary_type(salary_type_id),
    title varchar(255) NOT NULL,
    caption text NOT NULL,
	created_on timestamp default NOW(),
    experience_type_id int REFERENCES experience_type(experience_type_id),
    active boolean default true,
    is_visible boolean default true,
    posting_search tsvector,
    PRIMARY KEY(post_id)
);
CREATE INDEX job_posting_all_active_idx ON job_posting_all(active);
CREATE INDEX job_posting_all_tsv_idx ON job_posting_all USING gin(posting_search);
CREATE TRIGGER job_posting_all_search_vector_update
BEFORE INSERT OR UPDATE
ON job_posting_all
FOR EACH ROW EXECUTE PROCEDURE
tsvector_update_trigger (posting_search, 'pg_catalog.simple', title, caption);

CREATE TABLE job_recruiter_posting (
    post_id bigint REFERENCES job_posting_all(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    PRIMARY KEY(post_id, recruiter_id)
);
CREATE INDEX job_recruiter_posting_idx ON job_recruiter_posting(post_id);

CREATE VIEW job_posting AS 
SELECT jpa.*, jrp.recruiter_id
FROM job_posting_all jpa
INNER JOIN job_recruiter_posting jrp ON jpa.post_id = jrp.post_id
WHERE active AND is_visible;


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
    image_id varchar(128),
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
CREATE TABLE denial_reason (
    denial_reason_id serial,
    denial_reason_text varchar(256),
    PRIMARY KEY(denial_reason_id)
);
CREATE TABLE candidate_posting (
    candidate_id bigint REFERENCES candidate(candidate_id),
    post_id bigint REFERENCES job_posting_all(post_id),
    recruiter_id bigint REFERENCES recruiter(recruiter_id),
    created_on timestamp default NOW(),
    migaloo_responded_on timestamp,
    employer_responded_on timestamp,
    job_responded_on timestamp,
    migaloo_accepted boolean default NULL,
    employer_accepted boolean default NULL,
    job_accepted boolean default NULL,
    has_seen_post boolean default false,
    has_seen_response boolean default false,
    denial_reason_id int REFERENCES denial_reason(denial_reason_id),
    comment varchar(512),
    denial_comment varchar(512),
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
    post_id bigint REFERENCES job_posting_all(post_id),
    unique (user_id_1, user_id_2, subject_user_id, post_id),
    unique (post_id),
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
    meeting_subject varchar(500) not null,
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

CREATE OR REPLACE FUNCTION messages_InsteadOfInsert_pr() RETURNS trigger AS $$
DECLARE 
    MessageID bigint;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.created_on is NULL) THEN
            NEW.created_on = NOW();
        END IF;
        Insert into messages_base(message_type_id, to_id, message_subject_id, created_on) VALUES (
            NEW.message_type_id,
            NEW.to_id, NEW.message_subject_id, NEW.created_on)
        RETURNING message_id into MessageID;

        IF (NEW.message_type_id = 1) THEN -- Chat
            Insert into messages_chat(message_id_chat, message)
            VALUES (MessageID, NEW.message);
        ELSIF (NEW.message_type_id = 2) THEN -- Calander
            Insert into messages_calander(message_id_calander, date_offer, minute_length, location_type, meeting_subject)
            VALUES (MessageID, NEW.date_offer, NEW.minute_length, NEW.location_type, NEW.meeting_subject);
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

            Insert into messages_calander(message_id_calander, date_offer, minute_length, location_type, response, meeting_subject)
                SELECT MessageID, date_offer, minute_length, location_type, NEW.response, meeting_subject
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
CREATE TABLE tag_type (
    tag_type_id serial UNIQUE,
    tag_type_name varchar(64) NOT NULL,
    PRIMARY KEY(tag_type_id)
);
CREATE TABLE tags (
    tag_id bigserial UNIQUE,
    tag_name varchar(64) NOT NULL,
    tag_type_id int REFERENCES tag_type(tag_type_id),
    PRIMARY KEY(tag_id, tag_type_id)
);
CREATE INDEX tag_name_lower_idx ON tags ((lower(tag_name)));

CREATE TABLE tags_equality (
    tag_id_1 bigint REFERENCES tags(tag_id),
    tag_id_2 bigint REFERENCES tags(tag_id),
    similarity float,
    PRIMARY KEY(tag_id_1, tag_id_2)
);

CREATE TABLE posting_tags (
    post_id bigint REFERENCES job_posting_all(post_id),
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
    l.created_on, l.user_id, l.user_type_id, l.last_login, l.email, ut.user_type_name,
    coalesce(c.first_name, r.first_name, ac.first_name) as first_name,
    coalesce(e.company_name) as company_name, 
    coalesce(c.last_name, r.last_name, ac.last_name) as last_name,
    coalesce(c.name_search, r.name_search, ac.name_search, e.company_name_search) as name_search,
    coalesce(c.phone_number, r.phone_number, ac.phone_number) as phone_number,
    coalesce(c.rating, r.rating, e.rating) as rating,
    coalesce(c.active, r.active, ac.active) as active,
    coalesce(c.image_id, r.image_id, ac.image_id) as image_id,
    (CASE WHEN l.passwordhash IS NULL THEN false ELSE true END) as account_active,
    is_primary
FROM login l
INNER JOIN user_type ut ON ut.user_type_id = l.user_type_id
LEFT JOIN candidate c ON c.candidate_id = l.user_id
LEFT JOIN recruiter r ON r.recruiter_id = l.user_id
LEFT JOIN company e ON e.company_id = l.user_id
LEFT JOIN account_manager ac ON ac.account_manager_id = l.user_id
LEFT JOIN (
    SELECT bool_or(is_primary) as is_primary, company_contact_id
    FROM company_contact
    GROUP BY company_contact_id
) ip ON ip.company_contact_id = l.user_id;

-- DATA START
INSERT INTO denial_reason (denial_reason_text) VALUES
    ('Other candidates are better'),
    ('Rejected before the interview'),
    ('Rejected following the interview'),
    ('Other candidate chosen'),
    ('Failed background check'),
    ('Failed drug screening');
INSERT INTO messages_type (message_type_id, message_type_name) VALUES
    (1, 'Chat'),
    (2, 'Calander');
INSERT INTO location_type (location_type_id, location_type_name) VALUES
    (1, 'Phone'),
    (2, 'In-Person');
INSERT INTO user_type (user_type_name) VALUES
    ('Recruiter'),
    ('Account Manager'),
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
INSERT INTO tag_type (tag_type_name) VALUES
    ('Unknown'),
    ('Programming Language'),
    ('Operating System'),
    ('Programs'),
    ('Management Style');
    
INSERT INTO tags (tag_name, tag_type_id) VALUES
    ('A# .NET', 2), ('A-0 System', 2), ('A+', 2), ('A++', 2), ('ABAP', 2), ('ABC', 2),
    ('ABSET', 2), ('ABSYS', 2), ('ACC', 2), ('Accent', 2), ('Ace DASL', 2), ('ACL2', 2),
    ('Action!', 2), ('ActionScript', 2), ('Actor', 2), ('Ada', 2), ('Adenine', 2), ('Agda', 2),
    ('Agora', 2), ('AIMMS', 2), ('Aldor', 2), ('Alef', 2), ('ALF', 2), ('ALGOL 58', 2),
    ('ALGOL 68', 2), ('ALGOL W', 2), ('Alice', 2), ('Alma-0', 2), ('AmbientTalk', 2), ('Amiga E', 2),
    ('AMPL', 2), ('AngelScript', 2), ('Apex', 2), ('APL', 2), ('AppleScript', 2), ('APT', 2),
    ('ARexx', 2), ('Argus', 2), ('AspectJ', 2), ('Assembly language', 2), ('ATS', 2), ('Ateji PX', 2),
    ('Autocoder', 2), ('AutoIt', 2), ('AutoLISP / Visual LISP', 2), ('Averest', 2), ('AWK', 2), ('Axum', 2),
    ('B', 2), ('Babbage', 2), ('Ballerina', 2), ('Bash', 2), ('BASIC', 2), ('bc', 2),
    ('BeanShell', 2), ('Batch file', 2), ('Bertrand', 2), ('BETA', 2), ('BLISS', 2), ('Blockly', 2),
    ('Boo', 2), ('Boomerang', 2), ('Bourne shell', 2), ('BPEL', 2), ('Business Basic', 2), ('C', 2),
    ('C++', 2), ('C*', 2), ('C#', 2), ('C/AL', 2), ('Caché ObjectScript', 2), ('C Shell', 2),
    ('Cayenne', 2), ('CDuce', 2), ('Cecil', 2), ('Cesil', 2), ('Céu', 2), ('Ceylon', 2),
    ('Cg', 2), ('Ch', 2), ('Chapel', 2), ('Charity', 2), ('Charm', 2), ('CHILL', 2),
    ('chomski', 2), ('ChucK', 2), ('Cilk', 2), ('Citrine', 2), ('CL', 2), ('Claire', 2),
    ('Clean', 2), ('Clipper', 2), ('CLIPS', 2), ('CLIST', 2), ('Clojure', 2), ('CLU', 2),
    ('COBOL', 2), ('CobolScript', 2), ('Cobra', 2), ('CoffeeScript', 2), ('ColdFusion', 2), ('COMAL', 2),
    ('COMIT', 2), ('Common Intermediate Language', 2), ('Common Lisp', 2), ('COMPASS', 2), ('Component Pascal', 2), ('Constraint Handling Rules', 2),
    ('Cool', 2), ('Coq', 2), ('Coral 66', 2), ('CorVision', 2), ('COWSEL', 2), ('CPL', 2),
    ('Crystal', 2), ('Csound', 2), ('CSP', 2), ('Cuneiform', 2), ('Curl', 2), ('Curry', 2),
    ('Cyclone', 2), ('Cython', 2), ('D', 2), ('DASL', 2), ('Dart', 2), ('Darwin', 2),
    ('Datalog', 2), ('DATATRIEVE', 2), ('dBase', 2), ('dc', 2), ('DCL', 2), ('DinkC', 2),
    ('Dog', 2), ('Draco', 2), ('DRAKON', 2), ('Dylan', 2), ('DYNAMO', 2), ('DAX', 2),
    ('Ease', 2), ('Easy PL/I', 2), ('EASYTRIEVE PLUS', 2), ('eC', 2), ('ECMAScript', 2), ('Edinburgh IMP', 2),
    ('Eiffel', 2), ('ELAN', 2), ('Elixir', 2), ('Elm', 2), ('Emacs Lisp', 2), ('Emerald', 2),
    ('EPL', 2), ('Erlang', 2), ('es', 2), ('Escher', 2), ('ESPOL', 2), ('Esterel', 2),
    ('Euclid', 2), ('Euler', 2), ('Euphoria', 2), ('EusLisp Robot Programming Language', 2), ('CMS EXEC', 2), ('EXEC 2', 2),
    ('Ezhil', 2), ('F', 2), ('F#', 2), ('F*', 2), ('Factor', 2), ('Fantom', 2),
    ('FFP', 2), ('Fjölnir', 2), ('FL', 2), ('Flavors', 2), ('Flex', 2), ('FlooP', 2),
    ('FOCAL', 2), ('FOCUS', 2), ('FOIL', 2), ('FORMAC', 2), ('@Formula', 2), ('Forth', 2),
    ('Fortress', 2), ('FoxPro', 2), ('FP', 2), ('Franz Lisp', 2), ('F-Script', 2), ('G', 2),
    ('GameMonkey Script', 2), ('GAMS', 2), ('GAP', 2), ('G-code', 2), ('GDScript', 2), ('Genie', 2),
    ('GEORGE', 2), ('GLSL', 2), ('GNU E', 2), ('Go', 2), ('Go!', 2), ('GOAL', 2),
    ('Golo', 2), ('GOM', 2), ('Google Apps Script', 2), ('Gosu', 2), ('GOTRAN', 2), ('GPSS', 2),
    ('GRASS', 2), ('Grasshopper', 2), ('Groovy', 2), ('H', 2), ('Hack', 2), ('HAGGIS', 2),
    ('Halide', 2), ('Hamilton C shell', 2), ('Harbour', 2), ('Hartmann pipelines', 2), ('Haskell', 2), ('Haxe', 2),
    ('High Level Assembly', 2), ('HLSL', 2), ('HolyC', 2), ('Hop', 2), ('Hopscotch', 2), ('Hope', 2),
    ('Hume', 2), ('HyperTalk', 2), ('I', 2), ('Io', 2), ('Icon', 2), ('IBM Basic assembly language', 2),
    ('IBM HAScript', 2), ('IBM Informix-4GL', 2), ('IBM RPG', 2), ('Irineu', 2), ('IDL', 2), ('Idris', 2),
    ('J', 2), ('J#', 2), ('J++', 2), ('JADE', 2), ('JAL', 2), ('Janus', 2),
    ('Java', 2), ('JavaFX Script', 2), ('JavaScript', 2), ('JCL', 2), ('JEAN', 2), ('Join Java', 2),
    ('Joule', 2), ('JOVIAL', 2), ('Joy', 2), ('JScript', 2), ('JScript .NET', 2), ('JSON', 2),
    ('Jython', 2), ('K', 2), ('Kaleidoscope', 2), ('Karel', 2), ('KEE', 2), ('Kixtart', 2),
    ('KIF', 2), ('Kojo', 2), ('Kotlin', 2), ('KRC', 2), ('KRL', 2), ('KRYPTON', 2),
    ('Kodu', 2), ('Kv', 2), ('L', 2), ('LabVIEW', 2), ('Ladder', 2), ('LANSA', 2),
    ('LaTeX', 2), ('Lava', 2), ('LC-3', 2), ('Legoscript', 2), ('LIL', 2), ('LilyPond', 2),
    ('Limnor', 2), ('LINC', 2), ('Lingo', 2), ('LINQ', 2), ('LIS', 2), ('LISA', 2),
    ('Lite-C', 2), ('Lithe', 2), ('Little b', 2), ('LLL', 2), ('Logo', 2), ('Logtalk', 2),
    ('LPC', 2), ('LSE', 2), ('LSL', 2), ('LiveCode', 2), ('LiveScript', 2), ('Lua', 2),
    ('Lustre', 2), ('LYaPAS', 2), ('Lynx', 2), ('M', 2), ('M2001', 2), ('M4', 2),
    ('Machine code', 2), ('MAD', 2), ('MAD/I', 2), ('Magik', 2), ('Magma', 2), ('Make', 2),
    ('Maple', 2), ('MAPPER', 2), ('MARK-IV', 2), ('Mary', 2), ('MASM Microsoft Assembly x86', 2), ('MATH-MATIC', 2),
    ('MATLAB', 2), ('Maxima', 2), ('Max', 2), ('MaxScript', 2), ('Maya', 2), ('MDL', 2),
    ('Mesa', 2), ('Metafont', 2), ('MetaQuotes Language', 2), ('MHEG-5', 2), ('Microcode', 2), ('MicroScript', 2),
    ('Milk', 2), ('MIMIC', 2), ('Mirah', 2), ('Miranda', 2), ('MIVA Script', 2), ('ML', 2),
    ('Modelica', 2), ('Modula', 2), ('Modula-2', 2), ('Modula-3', 2), ('Mohol', 2), ('MOO', 2),
    ('Mouse', 2), ('MPD', 2), ('Mathcad', 2), ('MSL', 2), ('MUMPS', 2), ('MuPAD', 2),
    ('Mystic Programming Language', 2), ('N', 2), ('NASM', 2), ('Napier88', 2), ('Neko', 2), ('Nemerle', 2),
    ('Net.Data', 2), ('NetLogo', 2), ('NetRexx', 2), ('NewLISP', 2), ('NEWP', 2), ('Newspeak', 2),
    ('Nial', 2), ('Nice', 2), ('Nickle', 2), ('Nim', 2), ('NPL', 2), ('Not eXactly C', 2),
    ('NSIS', 2), ('Nu', 2), ('NWScript', 2), ('NXT-G', 2), ('O', 2), ('o:XML', 2),
    ('Oberon', 2), ('OBJ2', 2), ('Object Lisp', 2), ('ObjectLOGO', 2), ('Object REXX', 2), ('Object Pascal', 2),
    ('Objective-J', 2), ('Obliq', 2), ('OCaml', 2), ('occam', 2), ('occam-π', 2), ('Octave', 2),
    ('Onyx', 2), ('Opa', 2), ('Opal', 2), ('OpenCL', 2), ('OpenEdge ABL', 2), ('OPL', 2),
    ('OPS5', 2), ('OptimJ', 2), ('Orc', 2), ('ORCA/Modula-2', 2), ('Oriel', 2), ('Orwell', 2),
    ('Oz', 2), ('P', 2), ('P4', 2), ('P′′', 2), ('ParaSail', 2), ('PARI/GP', 2),
    ('PCASTL', 2), ('PCF', 2), ('PEARL', 2), ('PeopleCode', 2), ('Perl', 2), ('PDL', 2),
    ('Pharo', 2), ('PHP', 2), ('Pico', 2), ('Picolisp', 2), ('Pict', 2), ('Pig', 2),
    ('PIKT', 2), ('PILOT', 2), ('Pipelines', 2), ('Pizza', 2), ('PL-11', 2), ('PL/0', 2),
    ('PL/C', 2), ('PL/I', 2), ('PL/M', 2), ('PL/P', 2), ('PL/SQL', 2), ('PL360', 2),
    ('Plankalkül', 2), ('Planner', 2), ('PLEX', 2), ('PLEXIL', 2), ('Plus', 2), ('POP-11', 2),
    ('PostScript', 2), ('PortablE', 2), ('POV-Ray SDL', 2), ('Powerhouse', 2), ('PowerBuilder', 2), ('PowerShell', 2),
    ('Processing', 2), ('Processing.js', 2), ('Prograph', 2), ('PROIV', 2), ('Prolog', 2), ('PROMAL', 2),
    ('PROSE modeling language', 2), ('PROTEL', 2), ('ProvideX', 2), ('Pro*C', 2), ('Pure', 2), ('PureBasic', 2),
    ('Python', 2), ('Q', 2), ('Q#', 2), ('Qalb', 2), ('QtScript', 2), ('QuakeC', 2),
    ('R', 2), ('R++', 2), ('Racket', 2), ('RAPID', 2), ('Rapira', 2), ('Ratfiv', 2),
    ('rc', 2), ('Reason', 2), ('REBOL', 2), ('Red', 2), ('Redcode', 2), ('REFAL', 2),
    ('Ring', 2), ('Rlab', 2), ('ROOP', 2), ('RPG', 2), ('RPL', 2), ('RSL', 2),
    ('Ruby', 2), ('RuneScript', 2), ('Rust', 2), ('S', 2), ('S2', 2), ('S3', 2),
    ('S-PLUS', 2), ('SA-C', 2), ('SabreTalk', 2), ('SAIL', 2), ('SALSA', 2), ('SAM76', 2),
    ('SASL', 2), ('Sather', 2), ('Sawzall', 2), ('Scala', 2), ('Scheme', 2), ('Scilab', 2),
    ('Script.NET', 2), ('Sed', 2), ('Seed7', 2), ('Self', 2), ('SenseTalk', 2), ('SequenceL', 2),
    ('SETL', 2), ('SIMPOL', 2), ('SIGNAL', 2), ('SiMPLE', 2), ('SIMSCRIPT', 2), ('Simula', 2),
    ('Singularity', 2), ('SISAL', 2), ('SLIP', 2), ('SMALL', 2), ('Smalltalk', 2), ('SML', 2),
    ('Snap!', 2), ('SNOBOL', 2), ('Snowball', 2), ('SOL', 2), ('Solidity', 2), ('SOPHAEROS', 2),
    ('Speedcode', 2), ('SPIN', 2), ('SP/k', 2), ('SPS', 2), ('SQL', 2), ('SQR', 2),
    ('Squirrel', 2), ('SR', 2), ('S/SL', 2), ('Starlogo', 2), ('Strand', 2), ('Stata', 2),
    ('Subtext', 2), ('SBL', 2), ('SuperCollider', 2), ('SuperTalk', 2), ('Swift', 2), ('SYMPL', 2),
    ('T', 2), ('TACL', 2), ('TACPOL', 2), ('TADS', 2), ('TAL', 2), ('Tcl', 2),
    ('TECO', 2), ('TELCOMP', 2), ('TeX', 2), ('TEX', 2), ('TIE', 2), ('TMG, compiler-compiler', 2),
    ('TOM', 2), ('Toi', 2), ('Topspeed', 2), ('TPU', 2), ('Trac', 2), ('TTM', 2),
    ('Transcript', 2), ('TTCN', 2), ('Turing', 2), ('TUTOR', 2), ('TXL', 2), ('TypeScript', 2),
    ('U', 2), ('Ubercode', 2), ('UCSD Pascal', 2), ('Umple', 2), ('Unicon', 2), ('Uniface', 2),
    ('Unix shell', 2), ('UnrealScript', 2), ('V', 2), ('Vala', 2), ('Verilog', 2), ('VHDL', 2),
    ('Viper', 2), ('Visual Basic', 2), ('Visual Basic .NET', 2), ('Visual DataFlex', 2), ('Visual DialogScript', 2), ('Visual Fortran', 2),
    ('Visual J++', 2), ('Visual J#', 2), ('Visual LISP', 2), ('Visual Objects', 2), ('Visual Prolog', 2), ('VSXu', 2),
    ('WATFIV', 2), ('WebAssembly', 2), ('WebDNA', 2), ('Whiley', 2), ('Winbatch', 2), ('Wolfram Language', 2),
    ('X', 2), ('X++', 2), ('X10', 2), ('xBase', 2), ('xBase++', 2), ('XBL', 2),
    ('xHarbour', 2), ('XL', 2), ('Xojo', 2), ('XOTcl', 2), ('XOD', 2), ('XPath', 2),
    ('XPL0', 2), ('XQuery', 2), ('XSB', 2), ('XSharp', 2), ('XSLT', 2), ('Xtend', 2),
    ('Yorick', 2), ('YQL', 2), ('Yoix', 2), ('Z', 2), ('Z notation', 2), ('Zebra', 2),
    ('ZetaLisp', 2), ('ZOPL', 2), ('Zsh', 2), ('ZPL', 2), ('Z++', 2),
    ('Linux', 3), ('Redhat', 3), ('Debian', 3), ('Windows', 3),
    ('Microsoft Excel', 4), ('Microsoft Office', 4),
    ('Architecture Design', 5), ('Agile', 5), ('Project Management', 5), ('Leadership', 5), ('Waterfall', 5);
-- FAKE DATA START
INSERT INTO login (user_id, email, passwordhash, created_on, user_type_id) VALUES 
    (1, 'r1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-17 10:23:54', 1), -- Add Recruiter, pass: test
    (2, 'r2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-11-25 10:23:54', 1), -- Add Recruiter, pass: test
    (3, 'r3@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2018-12-25 10:23:54', 1), -- Add Recruiter, pass: test
    (100, 'e1@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-01-21 10:23:54', 2), -- Add Account Manager, pass: test
    (101, 'e2@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Account Manager, pass: test
    (102, 'e3@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Account Manager, pass: test
    (103, 'e4@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Account Manager, pass: test
    (104, 'e5@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Account Manager, pass: test
    (105, 'e6@test.com', '$2a$10$NXC07uq0myM5IARD6c4cdOtGMt21hWN1JB9w77BE1yLDUCMUO9thq', TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Account Manager, pass: test
    (106, 'e7@test.com', NULL, TIMESTAMP '2019-02-20 10:23:54', 2), -- Add Employer, pass: test
    (500, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (501, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (502, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (503, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4), -- Dummy Employer, pass: test
    (504, NULL, NULL, TIMESTAMP '2019-02-20 10:23:54', 4); -- Dummy Employer, pass: test
INSERT INTO login (user_id, email, created_on, user_type_id) VALUES 
    (1000, 'c1@test.com', TIMESTAMP '2019-02-17 10:23:54', 3), -- Add candidate
    (1001, 'c2@test.com', TIMESTAMP '2018-11-25 10:23:54', 3), -- Add candidate
    (1002, 'c3@test.com', TIMESTAMP '2018-12-25 10:23:54', 3), -- Add candidate
    (1003, 'c4@test.com', TIMESTAMP '2019-01-21 10:23:54', 3), -- Add candidate
    (1004, 'c5@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1005, 'c6@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1006, 'c7@test.com', TIMESTAMP '2019-02-20 10:23:54', 3), -- Add candidate
    (1007, 'c8@test.com', TIMESTAMP '2019-02-20 10:23:54', 3); -- Add candidate
INSERT INTO address (address_line_1, city, state_code, country_code, state, country, lat, lon) VALUES 
    ('123 Main St.', 'Toronto', 'ON', 'CA', 'Ontario', 'Canada', 43.6531, -79.3831),
    ('4312 Dundas Rd.', 'Toronto', 'ON', 'CA', 'Ontario', 'Canada', 43.6533, -79.3833),
    ('21 Backersfield Rd.', 'North York', 'ON', 'CA', 'Ontario', 'Canada', 43.65335, -79.38325),
    ('711 North Ave.', 'Toronto', 'ON', 'CA', 'Ontario', 'Canada', 43.65334, -79.38318);
INSERT INTO address (address_line_1, address_line_2, city, state_code, country_code, state, country, lat, lon) VALUES
    ('654 York Rd.', 'Suite 203', 'Toronto', 'ON', 'CA', 'Ontario', 'Canada', 43.65325, -79.38312),
    ('1325 York Rd.', 'Building 3', 'Toronto', 'ON', 'CA', 'Ontario', 'Canada', 43.65324, -79.38328);
INSERT INTO company (company_id, company_name, department, address_id) VALUES
    (500, 'Google Inc.', 'IT Services', 1), 
    (501, 'Microsoft Inc.', 'Information Technology Division', 2),
    (502, '123 Recruiters', null, 3),
    (503, 'Alegis Group', null, 4),
    (504, 'Robert Half', null, 5);
INSERT INTO account_manager (account_manager_id, first_name, last_name, phone_number) VALUES
    (100, 'Steve', 'Smith', '905-555-8942'), 
    (101, 'Jerry', 'McGuire', '905-555-0425'),
    (102, 'Tom', 'McInly', '905-555-7624'),
    (103, 'Arnold', 'Stone', '905-555-0786'),
    (104, 'Adam', 'Steal', '905-555-9782'),
    (105, 'Kelly', 'Rogers', '905-555-6456'),
    (106, 'Rebecca', 'Brown', NULL);
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
INSERT INTO company_contact (company_contact_id, company_id, is_primary) VALUES
    (100, 500, true), 
    (100, 501, true), 
    (101, 501, true),
    (102, 500, false),
    (103, 500, false),
    (104, 500, false),
    (105, 500, false),
    (106, 500, false),
    (1, 503, true),
    (2, 503, false),
    (3, 504, true);
INSERT INTO recruiter_candidate (candidate_id, recruiter_id, created_on) VALUES
    (1000, 1, NOW() - interval '1' day),
    (1001, 1, NOW() - interval '2' day),
    (1001, 2, NOW() - interval '2' day),
    (1002, 3, NOW() - interval '3' day),
    (1003, 1, NOW() - interval '4' day),
    (1004, 1, NOW() - interval '5' day),
    (1005, 1, NOW() - interval '6' day),
    (1005, 2, NOW() - interval '6' day),
    (1006, 3, NOW() - interval '7' day),
    (1007, 1, NOW() - interval '8' day),
    (1007, 2, NOW() - interval '8' day),
    (1007, 3, NOW() - interval '8' day);
INSERT INTO job_posting_all (post_id, company_id, created_on, title, caption, experience_type_id, salary_type_id) VALUES
    (1, 500, NOW() - interval '5' minute, 'Senior Software Developer - Working on exciting projects', 'We are a small company that develops solutions to protect national security and everyday folks. That includes OS integration, programming in C, C++, Java, Scala, Python, JS, or whatever the job calls for, writing security policies, and everything in between.', 2, 4),
    (2, 501, NOW() - interval '1' hour, 'Software Developer', 'As a software developer, you will be a key individual contributor on a sprint team building the future software at the core of the business. The role is for a full stack developer with the ability to develop solutions for the user interface, business logic, persistence layer and data store. Developers are responsible for implementing well-defined requirements as part of the sprint team including unit tests.', null, 5),
    (3, 500, NOW() - interval '3' hour, 'Director of Technical Support', 'As Director of Technical Support for Tenable, you will provide strategic direction, leadership, development and management with our Americas Technical Support team. The Director of Technical Support is an experienced, enthusiastic, hands-on leader focused on building a world class Technical Support organization that is focused on delivering customer success. You will be the conduit between the Technical Support team, Customer Success Management team, Product and Development teams, and other internal stakeholders developing a trusted advisor relationship that enables rapid, focused, resolution for our customers. To be successful in this role, the Director of Technical Support must have the right combination of strategy, leadership and operational skills to manage a growing team of dedicated Technical Support Engineers.', 3, 6),
    (4, 501, NOW() - interval '1' day, 'IT Director', 'The primary directive of the IT Director is to ensure that the technology and computing needs of the company are met. The candidate will work with executive leadership to help develop and maintain an IT roadmap keeping the company�s future objectives in mind. This position requires significant hands-on technical knowledge and expertise coupled with solid business knowledge. The IT Director must be able to collaborate with internal customers to identify and prioritize business requirements and deliver business and technology solutions with a focus on process transformation from planning through implementation. They will support the organizational initiative of process re-engineering by involving client departments in process flow analysis and work re-design. ', 3, 7);
INSERT INTO job_recruiter_posting(post_id, recruiter_id) VALUES 
    (1, 1),(2, 1),(3, 1),(4, 1),
    (2, 2),(3, 2),(4, 2),
    (1, 3),(3, 3),(4, 3);

INSERT INTO candidate_posting (post_id, candidate_id, recruiter_id, coins, created_on, migaloo_responded_on, has_seen_post, has_seen_response, migaloo_accepted, comment) VALUES
    (1, 1000, 1, 10, NOW() - interval '1' day, NOW() - interval '0' day, true, false, true, 'I think this Sarah would be great for the job'),
    (1, 1001, 2, 5, NOW() - interval '2' day, NOW() - interval '1' day, true, false, false, 'Amanda has all of the skills you need'),
    (1, 1002, 3, 1, NOW() - interval '1' day, NULL, false, false, null, 'Beth is very respectable and I think she will be a great addition to your team'),
    (2, 1003, 1, 2, NOW() - interval '3' day, NOW() - interval '2' day, true, true, true, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (2, 1004, 1, 20, NOW() - interval '4' day, NOW() - interval '3' day, true, false, true, null),
    (2, 1005, 2, 30, NOW() - interval '2', NULL, false, false, null, null),
    (3, 1006, 3, 6, NOW() - interval '5' day, NOW() - interval '4' day, true, true, true, null),
    (3, 1007, 1, 7, NOW() - interval '3' day, NOW() - interval '1' day, true, false, false, null),
    (3, 1000, 1, 4, NOW() - interval '2' day, NULL, false, false, null, 'I think this Sarah would be great for the job'),
    (3, 1001, 2, 4, NOW() - interval '1' day, NOW() - interval '0' day, true, true, true, 'Amanda has all of the skills you need'),
    (4, 1002, 3, 20, NOW() - interval '3' day, NOW() - interval '2' day, true, false, false, 'Beth is very respectable and I think she will be a great addition to your team'),
    (4, 1003, 1, 9, NOW() - interval '4' day, NOW() - interval '3' day, true, true, true, 'Stephanie meets your criteria exactly, please have a look at her resume'),
    (4, 1004, 1, 8, NOW() - interval '5' day, NOW() - interval '4' day, true, false, false, null),
    (4, 1000, 1, 1, NOW() - interval '2' day, NULL, false, false, null, 'I think this Sarah would be great for the position you have open');
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
    (1, 500, 1000, 1, NOW() - interval '7' day), -- message_subject_id = 1
    (3, 500, 1006, 2, NOW() - interval '11' day), -- message_subject_id = 2
    (1, 500, 1001, 3, NOW() - interval '1' day); -- message_subject_id = 3
INSERT INTO messages (message_type_id, to_id, message_subject_id, message, created_on) VALUES
    (1, 1, 1, 'We would like to hear more about sarah.', NOW() - interval '6' day),
    (1, 500, 1, 'She is a really excellent candidate, she has a lot of expierence as a senior software developer and has run many teams, including a 30 person team in her last job.', NOW() - interval '5' day),
    (1, 1, 1, 'That sounds great lets have a call tommorow for a follow-up, I will send two meeting requests, let me know what works.', NOW() - interval '4' day),
    (1, 1, 1, 'One more follow up.', NOW() - interval '2.2' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', NOW() - interval '10' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', NOW() - interval '9' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', NOW() - interval '8' day),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', NOW() - interval '7' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', NOW() - interval '6' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', NOW() - interval '5' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', NOW() - interval '4' day),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', NOW() - interval '3' day),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', NOW() - interval '2' day),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', NOW() - interval '1' day),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', NOW() - interval '12' hour),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', NOW() - interval '11' hour),
    (1, 3, 2, 'We would like to move forward with Stephanie, can we please set up a time for a call this week', NOW() - interval '10' hour),
    (1, 500, 2, 'Hi Steve that is great, I am free tommorow any time, does 2PM work for you?', NOW() - interval '9' hour),
    (1, 3, 2, 'Actually, I have a meeting at 2, lets do 3:30PM', NOW() - interval '8' hour),
    (1, 500, 2, 'Yes that works, I look forward to hearing from you.', NOW() - interval '7' hour);
INSERT INTO messages (message_type_id, user_id_1, user_id_2, to_id, message_subject_id, date_offer, minute_length, location_type, meeting_subject, created_on) VALUES
    (2, 1, 500, 1, 1, NOW() - interval '63' hour, 30, 1, 'Initial Meeting, Time 1', NOW() - interval '72' hour),
    (2, 1, 500, 1, 1, NOW() - interval '60' hour, 30, 1, 'Initial Meeting, Time 2', NOW() - interval '72' hour),
    (2, 1, 500, 1, 1, NOW() + interval '12' hour, 60, 1, 'Follow up Meeting', NOW() - interval '48' hour);
UPDATE messages SET response = 1 WHERE message_id = 21;
UPDATE messages SET response = 2 WHERE message_id = 22;

SELECT setval(pg_get_serial_sequence('login', 'user_id'), max(user_id)) FROM login;
SELECT setval(pg_get_serial_sequence('address', 'address_id'), max(address_id)) FROM address;
SELECT setval(pg_get_serial_sequence('company', 'company_id'), max(company_id)) FROM company;
SELECT setval(pg_get_serial_sequence('candidate', 'candidate_id'), max(candidate_id)) FROM candidate;
SELECT setval(pg_get_serial_sequence('job_posting_all', 'post_id'), max(post_id)) FROM job_posting_all;
SELECT setval(pg_get_serial_sequence('recruiter', 'recruiter_id'), max(recruiter_id)) FROM recruiter;
SELECT setval(pg_get_serial_sequence('account_manager', 'account_manager_id'), max(account_manager_id)) FROM account_manager;

