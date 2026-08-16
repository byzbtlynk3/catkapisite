import React from 'react';
import SmartDrawingStudio from './SmartDrawingStudio';

interface Product {
  id: string;
  name?: string;
  title?: string;
  category: string;
  images?: string[];
  startingPrice?: number;
  campaignPrice?: number;
  isHidden?: boolean;
}

interface ConfiguratorProps {
  products?: Product[];
}

export default function Configurator({ products = [] }: ConfiguratorProps) {
  return <SmartDrawingStudio products={products} />;
}
