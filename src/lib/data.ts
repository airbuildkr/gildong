import { supabase } from "./supabase";
import { Post, PortfolioItem, Cash, TradeHistory, Agent, PostType } from "./types";
import * as mock from "./mock-data";

const USE_MOCK = !process.env.NEXT_PUBLIC_SUPABASE_URL;

// --- Agents ---

export async function getAgent(): Promise<Agent> {
  if (USE_MOCK) return mock.agent;
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("id", "gildong-v1")
    .single();
  return data ?? mock.agent;
}

// --- Posts ---

export async function getPosts(type?: PostType | "all"): Promise<Post[]> {
  if (USE_MOCK) return mock.getFilteredPosts(type);
  let query = supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (type && type !== "all") {
    query = query.eq("type", type);
  }
  const { data } = await query;
  return data ?? [];
}

export async function getPost(id: string): Promise<Post | null> {
  if (USE_MOCK) return mock.getPost(id) ?? null;
  const { data } = await supabase.from("posts").select("*").eq("id", id).single();
  return data;
}

// --- Portfolio ---

export async function getPortfolio(): Promise<PortfolioItem[]> {
  if (USE_MOCK) return mock.portfolio;
  const { data } = await supabase
    .from("portfolio")
    .select("*")
    .eq("agent_id", "gildong-v1")
    .order("profit_rate", { ascending: false });
  return data ?? [];
}

export async function getCash(): Promise<Cash> {
  if (USE_MOCK) return mock.cash;
  const { data } = await supabase
    .from("cash")
    .select("*")
    .eq("agent_id", "gildong-v1")
    .single();
  return data ?? mock.cash;
}

export async function getTradeHistory(): Promise<TradeHistory[]> {
  if (USE_MOCK) return mock.tradeHistory;
  const { data } = await supabase
    .from("trade_history")
    .select("*")
    .eq("agent_id", "gildong-v1")
    .order("date", { ascending: false });
  return data ?? [];
}

// --- Computed ---

export async function getPortfolioSummary() {
  const [portfolioItems, cashData, agentData] = await Promise.all([
    getPortfolio(),
    getCash(),
    getAgent(),
  ]);

  const stockValue = portfolioItems.reduce(
    (sum, item) => sum + item.current_price * item.quantity,
    0
  );
  const totalValue = stockValue + cashData.balance;
  const profitRate =
    ((totalValue - agentData.initial_capital) / agentData.initial_capital) * 100;
  const startDate = new Date(agentData.created_at);
  const now = new Date();
  const days = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    totalValue,
    profitRate,
    cashBalance: cashData.balance,
    days,
    items: portfolioItems,
  };
}
