const queries = {}

// query to create user entry - returns id of the user created
queries.CREATE_USER_SQL = 'insert into user_auth.user '
                        + '(first_name,last_name,email_address, creation_date, active,     modified_time) '
                        + 'values'
                        + '(        $1,      $1,            $1,  current_date,   true, current_timestamp) '
                        + 'returning user_id;';

// query to create user_seq entry
queries.CREATE_USER_SEQ_SQL = 'insert into user_auth.user_sec '
                            + '(user_id, user_pass, salt) '
                            + 'values '
                            + '(     $1,        $2,   $3);';

// query to create user_seq entry
queries.ASSIGN_ROLE_TO_USER = 'insert into user_auth.user_role '
                            + '(user_id, role_id) '
                            + 'values '
                            + '(     $1,      $2);';

export default queries;