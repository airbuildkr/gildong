create table agents (id text primary key, name text not null, description text, philosophy text, initial_capital bigint not null default 10000000, created_at timestamptz not null default now());

create table portfolio (id uuid primary key default gen_random_uuid(), agent_id text not null references agents(id), stock_code text not null, stock_name text not null, market text not null default 'KR' check (market in ('KR', 'US')), quantity integer not null default 0, avg_price numeric(12,2) not null default 0, current_price numeric(12,2) not null default 0, profit_rate numeric(6,2) not null default 0, updated_at timestamptz not null default now());

create table cash (id uuid primary key default gen_random_uuid(), agent_id text not null references agents(id), balance bigint not null default 0, updated_at timestamptz not null default now());

create table decisions (id uuid primary key default gen_random_uuid(), agent_id text not null references agents(id), date date not null, action text not null check (action in ('buy', 'sell', 'hold')), stock_code text, stock_name text, quantity integer, price integer, confidence text, reasoning text, created_at timestamptz not null default now());

create table posts (id uuid primary key default gen_random_uuid(), agent_id text not null references agents(id), type text not null check (type in ('morning', 'trade', 'weekly')), title text not null, content text not null, summary text, published_at timestamptz not null default now(), created_at timestamptz not null default now());

create table market_data (id uuid primary key default gen_random_uuid(), date date not null, stock_code text not null, stock_name text not null, market text not null default 'KR' check (market in ('KR', 'US')), unique (date, stock_code), open_price numeric(12,2), close_price numeric(12,2), high_price numeric(12,2), low_price numeric(12,2), volume bigint, change_rate numeric(6,2), news_summary text, created_at timestamptz not null default now());

create table trade_history (id uuid primary key default gen_random_uuid(), agent_id text not null references agents(id), date date not null, action text not null check (action in ('buy', 'sell')), stock_code text not null, stock_name text not null, quantity integer not null, price integer not null, total_amount bigint not null, profit_loss numeric(6,2), created_at timestamptz not null default now());

create index idx_posts_agent_type on posts(agent_id, type);
create index idx_posts_published_at on posts(published_at desc);
create index idx_portfolio_agent on portfolio(agent_id);
create index idx_trade_history_agent on trade_history(agent_id);
create index idx_decisions_agent_date on decisions(agent_id, date);
create index idx_market_data_date on market_data(date, stock_code);

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

insert into agents (id, name, description, philosophy, initial_capital) values ('gildong-v1', '길동 v1', '확신 없으면 쉽니다', '확신이 70% 이상일 때만 행동하고, 한 번에 총 자산의 20% 이상 투자하지 않습니다. 모든 판단을 쉬운 말로 설명하고, 틀렸을 때 변명하지 않고 원인을 분석합니다.', 10000000);

insert into cash (agent_id, balance) values ('gildong-v1', 10000000);
