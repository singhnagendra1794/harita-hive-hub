-- Update pricing for premium plugins to $14.99
UPDATE marketplace_tools 
SET 
  base_price_usd = 14.99,
  base_price_inr = 1249  -- Approximate INR equivalent
WHERE is_free = false;

-- Update sample data in EnhancedPluginMarketplace for consistency
-- This will be reflected when the component loads sample data