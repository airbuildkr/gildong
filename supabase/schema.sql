-- gildong.ai DB Schema

create table agents (
  id text primary key,
  name text not null,
  description text,
  philosophy text,
  initial_capital bigint not null default 10000000,
  created_at timestamptz not null default now()
);

create table portfolio (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  stock_code text not null,
  stock_name text not null,
  quantity integer not null default 0,
  avg_price integer not null default 0,
  current_price integer not null default 0,
  profit_rate numeric(6,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table cash (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  balance bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table decisions (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  date date not null,
  action text not null check (action in ('buy', 'sell', 'hold')),
  stock_code text,
  stock_name text,
  quantity integer,
  price integer,
  confidence text,
  reasoning text,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  type text not null check (type in ('morning', 'trade', 'weekly')),
  title text not null,
  content text not null,
  summary text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table market_data (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  stock_code text not null,
  stock_name text not null,
  unique (date, stock_code),
  open_price integer,
  close_price integer,
  high_price integer,
  low_price integer,
  volume bigint,
  change_rate numeric(6,2),
  news_summary text,
  created_at timestamptz not null default now()
);

create table trade_history (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references agents(id),
  date date not null,
  action text not null check (action in ('buy', 'sell')),
  stock_code text not null,
  stock_name text not null,
  quantity integer not null,
  price integer not null,
  total_amount bigint not null,
  profit_loss numeric(6,2),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_posts_agent_type on posts(agent_id, type);
create index idx_posts_published_at on posts(published_at desc);
create index idx_portfolio_agent on portfolio(agent_id);
create index idx_trade_history_agent on trade_history(agent_id);
create index idx_decisions_agent_date on decisions(agent_id, date);
create index idx_market_data_date on market_data(date, stock_code);

-- Enable RLS (Row Level Security) - read only for anonymous
alter table agents enable row level security;
alter table portfolio enable row level security;
alter table cash enable row level security;
alter table posts enable row level security;
alter table trade_history enable row level security;

create policy "Public read agents" on agents for select using (true);
create policy "Public read portfolio" on portfolio for select using (true);
create policy "Public read cash" on cash for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public read trade_history" on trade_history for select using (true);
