/*
          # [Initial Schema Setup]
          This script creates the complete initial database schema for the BARBER & BELLA APP.
          It includes tables for all core functionalities like clients, services, appointments, sales, and configurations.
          Row Level Security (RLS) is enabled on all tables to ensure data privacy and security from the start.

          ## Query Description: [This operation will create a new database structure. It is safe to run on a new project but could conflict with existing tables if any are present. It is designed to be the foundational schema for the application.]
          
          ## Metadata:
          - Schema-Category: ["Structural"]
          - Impact-Level: ["High"]
          - Requires-Backup: false
          - Reversible: false
          
          ## Structure Details:
          - Creates multiple ENUM types for statuses.
          - Creates tables: profiles, companies, clients, employees, services, products, payment_methods, specialties, service_combos, product_combos, appointments, sales, financial_transactions, bot_settings, and several join tables.
          - Establishes foreign key relationships between tables.
          - Creates a trigger to populate the profiles table from auth.users.
          
          ## Security Implications:
          - RLS Status: Enabled on all new tables.
          - Policy Changes: No, creates initial policies.
          - Auth Requirements: Requires user to be authenticated to access data.
          
          ## Performance Impact:
          - Indexes: Primary keys and foreign keys are indexed by default.
          - Triggers: One trigger is added on auth.users.
          - Estimated Impact: Low, as this is an initial setup.
          */

-- ========= ENUM TYPES =========
CREATE TYPE public.appointment_status AS ENUM ('agendado', 'concluido', 'cancelado', 'no-show');
CREATE TYPE public.payment_status AS ENUM ('pago', 'pendente');
CREATE TYPE public.financial_transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE public.financial_transaction_status AS ENUM ('pendente', 'pago', 'recebido', 'vencido');
CREATE TYPE public.discount_surcharge_type AS ENUM ('fixed', 'percent');

-- ========= PROFILES & COMPANIES =========
-- Stores public user data, linked to auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Stores company-specific information
CREATE TABLE public.companies (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    document TEXT, -- CPF/CNPJ
    phone TEXT,
    logo_url TEXT,
    working_hours JSONB,
    allow_discount BOOLEAN DEFAULT TRUE,
    max_discount_type discount_surcharge_type DEFAULT 'percent',
    max_discount_value NUMERIC(10, 2) DEFAULT 10,
    allow_surcharge BOOLEAN DEFAULT FALSE,
    max_surcharge_type discount_surcharge_type DEFAULT 'fixed',
    max_surcharge_value NUMERIC(10, 2) DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own company." ON public.companies FOR ALL USING (auth.uid() = user_id);

-- ========= CONFIGURATIONS =========
CREATE TABLE public.employees (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    service_commission NUMERIC(5, 2) NOT NULL DEFAULT 0,
    product_commission NUMERIC(5, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    working_hours JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage employees of their company." ON public.employees FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.payment_methods (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage payment methods of their company." ON public.payment_methods FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.specialties (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage specialties of their company." ON public.specialties FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.employee_specialties (
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    specialty_id BIGINT NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, specialty_id)
);
ALTER TABLE public.employee_specialties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage employee specialties of their company." ON public.employee_specialties FOR ALL USING (employee_id IN (SELECT id FROM public.employees WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

-- ========= REGISTRATIONS (CADASTROS) =========
CREATE TABLE public.clients (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage clients of their company." ON public.clients FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.services (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage services of their company." ON public.services FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.products (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cost_price NUMERIC(10, 2),
    sale_price NUMERIC(10, 2) NOT NULL,
    control_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INT DEFAULT 0,
    stock_min_threshold INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage products of their company." ON public.products FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.employee_services (
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, service_id)
);
ALTER TABLE public.employee_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage employee services of their company." ON public.employee_services FOR ALL USING (employee_id IN (SELECT id FROM public.employees WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

-- ========= COMBOS =========
CREATE TABLE public.service_combos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.service_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage service combos of their company." ON public.service_combos FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.service_combo_items (
    combo_id BIGINT NOT NULL REFERENCES public.service_combos(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (combo_id, service_id)
);
ALTER TABLE public.service_combo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage service combo items of their company." ON public.service_combo_items FOR ALL USING (combo_id IN (SELECT id FROM public.service_combos WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

CREATE TABLE public.product_combos (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.product_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage product combos of their company." ON public.product_combos FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.product_combo_items (
    combo_id BIGINT NOT NULL REFERENCES public.product_combos(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    PRIMARY KEY (combo_id, product_id)
);
ALTER TABLE public.product_combo_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage product combo items of their company." ON public.product_combo_items FOR ALL USING (combo_id IN (SELECT id FROM public.product_combos WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

-- ========= TRANSACTIONS =========
CREATE TABLE public.appointments (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE SET NULL,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'agendado',
    payment_status payment_status NOT NULL DEFAULT 'pendente',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage appointments of their company." ON public.appointments FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.appointment_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    appointment_id BIGINT NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES public.services(id) ON DELETE SET NULL,
    combo_id BIGINT REFERENCES public.service_combos(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL,
    duration_minutes INT NOT NULL,
    CONSTRAINT chk_item_type CHECK ( (service_id IS NOT NULL AND combo_id IS NULL) OR (service_id IS NULL AND combo_id IS NOT NULL) )
);
ALTER TABLE public.appointment_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage appointment items of their company." ON public.appointment_items FOR ALL USING (appointment_id IN (SELECT id FROM public.appointments WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

CREATE TABLE public.sales (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE SET NULL,
    employee_id BIGINT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    payment_method_id BIGINT REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    appointment_id BIGINT REFERENCES public.appointments(id) ON DELETE SET NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount_type discount_surcharge_type,
    discount_value NUMERIC(10, 2) DEFAULT 0,
    surcharge_type discount_surcharge_type,
    surcharge_value NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage sales of their company." ON public.sales FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

CREATE TABLE public.sale_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    sale_id BIGINT NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES public.services(id) ON DELETE SET NULL,
    product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
    service_combo_id BIGINT REFERENCES public.service_combos(id) ON DELETE SET NULL,
    product_combo_id BIGINT REFERENCES public.product_combos(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage sale items of their company." ON public.sale_items FOR ALL USING (sale_id IN (SELECT id FROM public.sales WHERE company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid())));

CREATE TABLE public.financial_transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type financial_transaction_type NOT NULL,
    status financial_transaction_status NOT NULL,
    due_date DATE,
    transaction_date TIMESTAMPTZ,
    category TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    sale_id BIGINT REFERENCES public.sales(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage financial transactions of their company." ON public.financial_transactions FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- ========= BOT SETTINGS =========
CREATE TABLE public.bot_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    company_id BIGINT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
    provider TEXT, -- 'meta', 'zapi', 'sleekflow'
    is_active BOOLEAN DEFAULT FALSE,
    api_keys JSONB, -- To store tokens and keys securely
    messages JSONB, -- To store welcome, menu, confirmation messages
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage bot settings of their company." ON public.bot_settings FOR ALL USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));
