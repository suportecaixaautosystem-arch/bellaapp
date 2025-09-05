export interface Product {
  id: number;
  name: string;
  costPrice?: string;
  salePrice: string;
  controlStock: boolean;
  stock?: number;
  stockMin?: number;
  active: boolean;
}

export const initialProducts: Product[] = [
    { id: 1, name: 'Shampoo Hidratante', costPrice: '15.00', salePrice: '35.00', controlStock: true, stock: 20, stockMin: 5, active: true },
    { id: 2, name: 'Condicionador Reparador', costPrice: '18.00', salePrice: '40.00', controlStock: true, stock: 15, stockMin: 5, active: true },
    { id: 3, name: 'Pomada Modeladora', salePrice: '50.00', controlStock: true, stock: 30, stockMin: 10, active: false },
    { id: 4, name: 'Esmalte Vermelho', costPrice: '5.00', salePrice: '12.00', controlStock: true, stock: 50, stockMin: 20, active: true },
    { id: 5, name: 'Taxa de Serviço Avulso', salePrice: '22.00', controlStock: false, active: true },
];
