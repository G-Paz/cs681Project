# .pgpass requires 0600 permission

# sudo -u postgres psql -U postgres -d postgres -f drop_db.sql -a
psql -U postgres -d postgres -f drop_db.sql -a;

# initialize db users
# sudo -u postgres psql -U postgres -d postgres -f postgres_startup.sql -a 
psql -U postgres -d postgres -f postgres_startup.sql -a;

# initialize db users
# sudo -u postgres psql -U postgres -d chess -f postgres_startup_init_structure.sql -a
psql -U postgres -d chess -f  postgres_startup_init_structure.sql -a;

# initialize chess database
# sudo -u postgres psql -U postgres -d chess -f postgres_startup_init_data.sql -a
psql -U postgres -d chess -f postgres_startup_init_data.sql -a;
