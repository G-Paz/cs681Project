# .pgpass requires 0600 permission

# sudo -u postgres psql -U postgres -d postgres -f drop_db.sql -a
psql -U postgres -d postgres -f drop_db.sql -a;

# create db users
# sudo -u postgres psql -U postgres -d postgres -f postgres_init_users.sql -a 
psql -U postgres -d postgres -f postgres_init_users.sql -a;

# create db structure
# sudo -u postgres psql -U postgres -d chess -f postgres_init_structure.sql -a
psql -U postgres -d chess -f  postgres_init_structure.sql -a;

# initialize db data
# sudo -u postgres psql -U postgres -d chess -f postgres_init_data.sql -a
psql -U postgres -d chess -f postgres_init_data.sql -a;
