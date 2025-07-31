import { serve } from "https://deno.land/x/supabase_functions@v1.0.0/mod.ts";

serve(async (_req) => {
  return new Response(
    JSON.stringify({ message: "extract-file-data edge function stub - implement business logic." }),
    { headers: { "Content-Type": "application/json" } },
  );
});