import React from 'react';
import CustomProduction from './CustomProduction';
import AiAssistant from './AiAssistant';
import SmartDrawingStudio from './SmartDrawingStudio';

interface DesignCenterProps {
  initialSubTab?: 'custom-production' | '3d-design' | 'ai-assistant';
  products?: any[];
  categories?: string[];
  onSelectProductDetail?: (product: any) => void;
  onNavigateTab?: (tab: string, category?: string) => void;
}

export default function DesignCenter({ 
  products = [],
  categories = [],
  onSelectProductDetail,
  onNavigateTab
}: DesignCenterProps) {
  // Currently simplified: Only 'custom-production' (Özel Üretim) is visible to end users.
  // SmartDrawingStudio and AiAssistant are preserved in imports for future re-activation.

  return (
    <div id="design-center-container" className="w-full bg-[#111111] min-h-screen text-white pt-2 pb-16">
      
      {/* Active Sub-Module: Custom Production (Özel Üretim) */}
      <div className="w-full transition-all">
        <CustomProduction />
      </div>

      {/* Hidden container maintaining reference to preserved components */}
      <div className="hidden">
        <SmartDrawingStudio products={products} onNavigateTab={onNavigateTab} />
        <AiAssistant 
          products={products} 
          categories={categories} 
          onSelectProductDetail={onSelectProductDetail} 
          onNavigateTab={onNavigateTab}
        />
      </div>

    </div>
  );
}
