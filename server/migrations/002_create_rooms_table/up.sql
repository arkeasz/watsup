
create table rooms (
  id bigint primary key generated always as identity,
  name text not null,
  created_by bigint references users(id) on delete set null,
  created_at timestamp with time zone default now()
);
