export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  typeof supabaseUrl === "string" &&
  supabaseUrl === "https://pzjbfhwzaettkzaxjdte.supabase.co" &&
  typeof supabaseAnonKey === "string" &&
  supabaseAnonKey.length > 0,
);
