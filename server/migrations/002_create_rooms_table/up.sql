
create table rooms (
  id bigint primary key generated always as identity,
  name text not null unique,
  created_at timestamp with time zone default now()
);

