import { useMemo } from 'react';

interface CurrencyPricing {
  currency: string;
  symbol: string;
  professional: number;
  enterprise: number;
  region: string;
}

export const useCurrencyPricing = (): CurrencyPricing => {
  return useMemo(() => {
    const detectUserRegion = () => {
      // Check timezone first
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta')) {
        return 'IN';
      }
      
      // Check locale as fallback
      const locale = navigator.language;
      if (locale.includes('en-IN') || locale.includes('hi')) {
        return 'IN';
      }
      
      return 'INTL';
    };

    const region = detectUserRegion();

    if (region === 'IN') {
      return {
        currency: 'INR',
        symbol: '₹',
        professional: 3999,
        enterprise: 7999,
        region: 'IN'
      };
    } else {
      return {
        currency: 'USD',
        symbol: '$',
        professional: 49,
        enterprise: 99,
        region: 'INTL'
      };
    }
  }, []);
};