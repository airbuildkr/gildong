export type PostType = "morning" | "trade" | "weekly";

export interface Agent {
  id: string;
  name: string;
  description: string;
  philosophy: string;
  initial_capital: number;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  agent_id: string;
  stock_code: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  profit_rate: number;
  updated_at: string;
}

export interface Cash {
  id: string;
  agent_id: string;
  balance: number;
  updated_at: string;
}

export interface Decision {
  id: string;
  agent_id: string;
  date: string;
  action: "buy" | "sell" | "hold";
  stock_code: string;
  stock_name: string;
  quantity: number;
  price: number;
  confidence: string;
  reasoning: string;
  created_at: string;
}

export interface Post {
  id: string;
  agent_id: string;
  type: PostType;
  title: string;
  content: string;
  summary: string;
  published_at: string;
  created_at: string;
}

export interface TradeHistory {
  id: string;
  agent_id: string;
  date: string;
  action: "buy" | "sell";
  stock_code: string;
  stock_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  profit_loss: number | null;
  created_at: string;
}
