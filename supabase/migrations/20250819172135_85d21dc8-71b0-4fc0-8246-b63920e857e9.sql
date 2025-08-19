-- Secure financial data tables: enforce RLS and restrict access to owners/admins
-- Tables: payment_transactions, payment_proofs, tool_orders, marketplace_purchases

-- Enforce and force RLS on all four tables
DO $$ BEGIN
  ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.payment_transactions FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.payment_proofs FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.tool_orders ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.tool_orders FORCE ROW LEVEL SECURITY;
  ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY; 
  ALTER TABLE public.marketplace_purchases FORCE ROW LEVEL SECURITY;
END $$;

-- Standardize admin policies to use is_admin_secure() and remove overly-permissive rules
DO $$
BEGIN
  -- payment_transactions
  DROP POLICY IF EXISTS "Super admin can manage all transactions" ON public.payment_transactions;
  DROP POLICY IF EXISTS "Admins can view all transactions" ON public.payment_transactions;
  CREATE POLICY "Admins can manage all transactions"
  ON public.payment_transactions
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
  -- keep user self-access policies (existing):
  --   "Users can insert their own transactions" (WITH CHECK auth.uid() = user_id)
  --   "Users can view their own transactions" (USING auth.uid() = user_id)

  -- payment_proofs
  DROP POLICY IF EXISTS "Super admin can manage all payments" ON public.payment_proofs;
  DROP POLICY IF EXISTS "Admins can view all payment proofs" ON public.payment_proofs;
  DROP POLICY IF EXISTS "Admins can update payment proofs" ON public.payment_proofs;
  CREATE POLICY "Admins can manage all payment proofs"
  ON public.payment_proofs
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
  -- keep user policies for insert/select self

  -- tool_orders
  DROP POLICY IF EXISTS "Service role can manage all orders" ON public.tool_orders;
  CREATE POLICY "Admins can manage all orders"
  ON public.tool_orders
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
  -- keep: "Insert orders for authenticated users" and "Users can view their own orders"

  -- marketplace_purchases
  DROP POLICY IF EXISTS "System can update purchase status" ON public.marketplace_purchases;
  CREATE POLICY "Admins can manage all purchases"
  ON public.marketplace_purchases
  FOR ALL
  USING (public.is_admin_secure())
  WITH CHECK (public.is_admin_secure());
  -- keep: "Users can create purchases" and "Users can view their purchases"
END $$;