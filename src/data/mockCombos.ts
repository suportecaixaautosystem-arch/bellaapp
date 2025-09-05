import { Service } from './mockServices';
import { Product } from './mockProducts';

export interface ServiceCombo {
  id: number;
  name: string;
  price: string;
  serviceIds: number[];
  active: boolean;
}

export interface ProductCombo {
  id: number;
  name: string;
  price: string;
  productIds: number[];
  active: boolean;
}

export const initialServiceCombos: ServiceCombo[] = [
  { id: 1, name: 'Cabelo + Barba', price: '60.00', serviceIds: [1, 3], active: true },
  { id: 2, name: 'Dia da Noiva Simples', price: '100.00', serviceIds: [2, 4], active: true },
];

export const initialProductCombos: ProductCombo[] = [
  { id: 1, name: 'Kit Hidratação Completa', price: '70.00', productIds: [1, 2], active: true },
];
