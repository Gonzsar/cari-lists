-- ============================================================
--  Mi Rinconcito · Sistema de amigos
--  Pegá TODO este archivo en:
--  Supabase → tu proyecto → SQL Editor → New query → Run
-- ============================================================

-- ---------- TABLAS ----------
create table if not exists profiles (
  code        text primary key,
  owner_token text not null,
  name        text default '',
  payload     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists friends (
  owner_code  text not null,
  friend_code text not null,
  created_at  timestamptz not null default now(),
  primary key (owner_code, friend_code)
);

-- ---------- SEGURIDAD ----------
-- RLS activo y SIN políticas = nadie puede tocar las tablas directamente.
-- Todo pasa por las funciones de abajo, que validan el token del dueño.
alter table profiles enable row level security;
alter table friends  enable row level security;

-- ---------- FUNCIONES ----------

-- Reservar un código nuevo
create or replace function claim_profile(p_code text, p_token text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(code, owner_token) values (lower(p_code), p_token);
  return true;
exception when unique_violation then
  return false;
end; $$;

-- Guardar mi perfil (solo si el token coincide)
create or replace function save_profile(p_code text, p_token text, p_name text, p_payload jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update profiles
     set name = p_name, payload = p_payload, updated_at = now()
   where code = lower(p_code) and owner_token = p_token;
  get diagnostics n = row_count;
  return n > 0;
end; $$;

-- Leer un perfil (público — nunca devuelve el token)
create or replace function get_profile(p_code text)
returns table(code text, name text, payload jsonb, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select p.code, p.name, p.payload, p.updated_at
  from profiles p where p.code = lower(p_code);
$$;

-- Agregar un amigo
create or replace function add_friend(p_code text, p_token text, p_friend text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if lower(p_code) = lower(p_friend) then return 'vos_mismo'; end if;
  perform 1 from profiles where code = lower(p_code) and owner_token = p_token;
  if not found then return 'no_auth'; end if;
  perform 1 from profiles where code = lower(p_friend);
  if not found then return 'no_existe'; end if;
  insert into friends(owner_code, friend_code)
  values (lower(p_code), lower(p_friend))
  on conflict do nothing;
  return 'ok';
end; $$;

-- Quitar un amigo
create or replace function remove_friend(p_code text, p_token text, p_friend text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  perform 1 from profiles where code = lower(p_code) and owner_token = p_token;
  if not found then return false; end if;
  delete from friends where owner_code = lower(p_code) and friend_code = lower(p_friend);
  return true;
end; $$;

-- Listar mis amigos
create or replace function list_friends(p_code text)
returns table(code text, name text, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select p.code, p.name, p.updated_at
  from friends f
  join profiles p on p.code = f.friend_code
  where f.owner_code = lower(p_code)
  order by p.name;
$$;

-- ---------- PERMISOS ----------
grant execute on function claim_profile(text, text)                to anon, authenticated;
grant execute on function save_profile(text, text, text, jsonb)    to anon, authenticated;
grant execute on function get_profile(text)                        to anon, authenticated;
grant execute on function add_friend(text, text, text)             to anon, authenticated;
grant execute on function remove_friend(text, text, text)          to anon, authenticated;
grant execute on function list_friends(text)                       to anon, authenticated;

-- ¡Listo! Ahora copiá de Settings → API:
--   • Project URL      → pegalo en Ajustes de la web
--   • anon public key  → pegalo en Ajustes de la web
