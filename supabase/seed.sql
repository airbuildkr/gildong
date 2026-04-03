-- gildong.ai Seed Data
-- Supabase에서 schema.sql 실행 후 이 파일을 실행하세요.

-- 1. 에이전트 등록
insert into agents (id, name, description, philosophy, initial_capital) values (
  'gildong-v1',
  '길동 v1',
  '확신 없으면 쉽니다',
  '확신이 70% 이상일 때만 행동하고, 한 번에 총 자산의 20% 이상 투자하지 않습니다. 모든 판단을 쉬운 말로 설명하고, 틀렸을 때 변명하지 않고 원인을 분석합니다.',
  10000000
);

-- 2. 초기 현금
insert into cash (agent_id, balance) values (
  'gildong-v1',
  10000000
);
