create table users (
  id bigint primary key generated always as identity,
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamp with time zone default now()
);
