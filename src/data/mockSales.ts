import { initialClients } from './mockClients';
import { initialEmployees } from './mockEmployees';
import { initialServices } from './mockServices';
import { initialProducts } from './mockProducts';
import { initialPaymentMethods } from '../pages/configurations/PaymentMethods';

type CartItem = {
    id: string;
    name: string;
    price: number;
    type: 'service' | 'product' | 'combo';
    quantity: number;
    employeeId?: number;
};

export type Sale = {
    id: string;
    items: CartItem[];
    clientId?: number;
    paymentMethod: string;
    discount: number;
    discountType: 'fixed' | 'percent';
    surcharge: number;
    surchargeType: 'fixed' | 'percent';
    subtotal: number;
    total: number;
    date: Date;
};

export const mockSales: Sale[] = [
    {
        id: 'SALE-1',
        items: [{ id: 'service-1', name: 'Corte Masculino', price: 35, type: 'service', quantity: 1, employeeId: 1 }],
        clientId: 2,
        paymentMethod: 'PIX',
        discount: 0,
        discountType: 'fixed',
        surcharge: 0,
        surchargeType: 'fixed',
        subtotal: 35,
        total: 35,
        date: new Date('2025-08-01T10:30:00')
    },
    {
        id: 'SALE-2',
        items: [
            { id: 'service-2', name: 'Corte Feminino', price: 60, type: 'service', quantity: 1, employeeId: 2 },
            { id: 'product-1', name: 'Shampoo Hidratante', price: 35, type: 'product', quantity: 1 }
        ],
        clientId: 1,
        paymentMethod: 'Cartão de Crédito',
        discount: 5,
        discountType: 'fixed',
        surcharge: 0,
        surchargeType: 'fixed',
        subtotal: 95,
        total: 90,
        date: new Date('2025-08-01T14:00:00')
    },
    {
        id: 'SALE-3',
        items: [{ id: 'combo-1', name: 'Cabelo + Barba', price: 60, type: 'combo', quantity: 1, employeeId: 3 }],
        clientId: 3,
        paymentMethod: 'Dinheiro',
        discount: 10,
        discountType: 'percent',
        surcharge: 0,
        surchargeType: 'fixed',
        subtotal: 60,
        total: 54,
        date: new Date('2025-08-05T18:00:00')
    },
    {
        id: 'SALE-4',
        items: [{ id: 'product-4', name: 'Esmalte Vermelho', price: 12, type: 'product', quantity: 2 }],
        paymentMethod: 'Cartão de Débito',
        discount: 0,
        discountType: 'fixed',
        surcharge: 0,
        surchargeType: 'fixed',
        subtotal: 24,
        total: 24,
        date: new Date('2025-08-10T11:00:00')
    }
];
