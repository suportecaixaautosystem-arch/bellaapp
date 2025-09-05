import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { Save, Upload, Building, Percent, DollarSign, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { Tables, TablesInsert, TablesUpdate } from '../../types/database.types';
import { cpfMask, cnpjMask, phoneMask, validateCPF, validateCNPJ } from '../../utils/validators';
import { useAuth } from '../../contexts/AuthContext';

type Company = Tables<'companies'>;
type FormState = Partial<Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

const defaultCompanyWorkingHours = (): Company['working_hours'] => [
  { day: 'Segunda-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Terça-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quarta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Quinta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sexta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Sábado', start: '09:00', end: '16:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
  { day: 'Domingo', start: '10:00', end: '14:00', active: false, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' }
];

const defaultFormState: FormState = {
  name: '',
  document: '',
  phone: '',
  allow_discount: false,
  max_discount_type: 'fixed',
  max_discount_value: 0,
  allow_surcharge: false,
  max_surcharge_type: 'fixed',
  max_surcharge_value: 0,
  working_hours: defaultCompanyWorkingHours()
};

const CompanySettings: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cnpj');
  const [formErrors, setFormErrors] = useState({ document: '', phone: '' });

  useEffect(() => {
    const fetchCompany = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .single();
        
        if (data) {
            setCompany(data);
            setFormState({
                ...data,
                working_hours: data.working_hours || defaultCompanyWorkingHours(),
            });
            if (data.document && data.document.replace(/\D/g, '').length === 11) {
                setDocumentType('cpf');
            }
        } else {
            setFormState(defaultFormState);
        }
        
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching company data:", error);
            alert("Erro ao carregar dados da empresa.");
        }
        setLoading(false);
    };
    fetchCompany();
  }, [user]);

  const handleFormChange = (field: keyof FormState, value: any) => {
    let maskedValue = value;
    if (field === 'document') {
        maskedValue = documentType === 'cpf' ? cpfMask(value) : cnpjMask(value);
    } else if (field === 'phone') {
        maskedValue = phoneMask(value);
    }
    setFormState(prev => ({ ...prev, [field]: maskedValue }));
    if(formErrors[field as keyof typeof formErrors]) {
        setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const newWorkingHours = [...(formState.working_hours as any[] || [])];
    (newWorkingHours[index] as any)[field] = value;
    setFormState(prev => ({ ...prev, working_hours: newWorkingHours }));
  };

  const validateAndSave = async () => {
    const errors = { document: '', phone: '' };
    let isValid = true;
    
    const docValue = formState.document?.replace(/\D/g, '') || '';
    if (docValue) {
        if (documentType === 'cpf' && !validateCPF(docValue)) {
            errors.document = 'CPF inválido.';
            isValid = false;
        }
        if (documentType === 'cnpj' && !validateCNPJ(docValue)) {
            errors.document = 'CNPJ inválido.';
            isValid = false;
        }
    }

    const phoneValue = formState.phone?.replace(/\D/g, '') || '';
    if (phoneValue && phoneValue.length < 10) {
        errors.phone = 'Telefone inválido.';
        isValid = false;
    }

    setFormErrors(errors);

    if (isValid) {
        handleSave();
    }
  };

  const handleSave = async () => {
    if (!user) {
        alert("Usuário não autenticado. Não é possível salvar.");
        return;
    }

    const companyDataToSave = {
        ...formState,
        user_id: user.id,
        name: formState.name || 'Minha Empresa',
    };

    if (company) { // Update existing company
        const { error } = await supabase
            .from('companies')
            .update(companyDataToSave as TablesUpdate<'companies'>)
            .eq('id', company.id);
        if (error) {
            alert("Erro ao salvar alterações: " + error.message);
        } else {
            alert("Alterações salvas com sucesso!");
        }
    } else { // Insert new company
        const { data: newCompany, error } = await supabase
            .from('companies')
            .insert(companyDataToSave as TablesInsert<'companies'>)
            .select()
            .single();

        if (error) {
            alert("Erro ao criar empresa: " + error.message);
        } else {
            alert("Empresa configurada com sucesso!");
            setCompany(newCompany);
        }
    }
  };

  if (loading) {
    return <div className="text-center p-8 flex items-center justify-center space-x-2"><Loader className="animate-spin h-5 w-5" /><span>Carregando configurações...</span></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Configurações da Empresa</h1>
        <p className="text-gray-400 mt-1">Gerencie as informações e regras do seu negócio</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Informações do Negócio</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-md font-semibold text-white mb-1">Logo do Salão</h3>
            <p className="text-sm text-gray-400 mb-4">Faça o upload da imagem da sua marca.</p>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                 <Building className="h-10 w-10 text-gray-500" />
              </div>
              <label htmlFor="logo-upload" className="cursor-pointer bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Fazer Upload</span>
              </label>
              <input id="logo-upload" type="file" className="hidden" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Salão</label>
              <input
                type="text"
                value={formState.name || ''}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Documento</label>
                <div className="flex items-center space-x-4 mb-2">
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="docType" value="cnpj" checked={documentType === 'cnpj'} onChange={() => setDocumentType('cnpj')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" /><span>CNPJ</span></label>
                    <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" name="docType" value="cpf" checked={documentType === 'cpf'} onChange={() => setDocumentType('cpf')} className="form-radio h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500" /><span>CPF</span></label>
                </div>
                <input
                    type="text"
                    value={formState.document || ''}
                    onChange={(e) => handleFormChange('document', e.target.value)}
                    placeholder={documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${formErrors.document ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
                />
                {formErrors.document && <p className="text-red-500 text-xs mt-1">{formErrors.document}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Telefone Comercial</label>
              <input
                type="tel"
                value={formState.phone || ''}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent text-white ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan-500'}`}
              />
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Regras de Venda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formState.allow_discount ?? false} onChange={(e) => handleFormChange('allow_discount', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                    <span className="font-medium text-white">Permitir Descontos</span>
                </div>
                <div className={`space-y-2 transition-opacity ${formState.allow_discount ? 'opacity-100' : 'opacity-50'}`}>
                    <label className="block text-sm font-medium text-gray-400">Limite máximo de desconto</label>
                    <div className="flex">
                        <input type="number" value={formState.max_discount_value || ''} onChange={e => handleFormChange('max_discount_value', parseFloat(e.target.value))} disabled={!formState.allow_discount} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50" />
                        <div className="flex">
                            <button type="button" onClick={() => handleFormChange('max_discount_type', 'percent')} disabled={!formState.allow_discount} className={`p-2 border border-l-0 ${formState.max_discount_type === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleFormChange('max_discount_type', 'fixed')} disabled={!formState.allow_discount} className={`p-2 border border-l-0 rounded-r-lg ${formState.max_discount_type === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={formState.allow_surcharge ?? false} onChange={(e) => handleFormChange('allow_surcharge', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                    <span className="font-medium text-white">Permitir Acréscimos</span>
                </div>
                <div className={`space-y-2 transition-opacity ${formState.allow_surcharge ? 'opacity-100' : 'opacity-50'}`}>
                    <label className="block text-sm font-medium text-gray-400">Valor do acréscimo</label>
                     <div className="flex">
                        <input type="number" value={formState.max_surcharge_value || ''} onChange={e => handleFormChange('max_surcharge_value', parseFloat(e.target.value))} disabled={!formState.allow_surcharge} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50" />
                        <div className="flex">
                            <button type="button" onClick={() => handleFormChange('max_surcharge_type', 'percent')} disabled={!formState.allow_surcharge} className={`p-2 border border-l-0 ${formState.max_surcharge_type === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                            <button type="button" onClick={() => handleFormChange('max_surcharge_type', 'fixed')} disabled={!formState.allow_surcharge} className={`p-2 border border-l-0 rounded-r-lg ${formState.max_surcharge_type === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Horários de Funcionamento</h2>
        <div className="space-y-2">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500">
            <div className="md:col-span-3">Dia</div>
            <div className="md:col-span-4">Horário de Trabalho</div>
            <div className="md:col-span-5">Intervalo</div>
          </div>
          {(formState.working_hours as any[])?.map((schedule: any, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border border-gray-800 rounded-lg bg-gray-950/50">
              <div className="md:col-span-3 flex items-center space-x-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={schedule.active} onChange={(e) => handleScheduleChange(index, 'active', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
                <span className={`font-medium ${schedule.active ? 'text-white' : 'text-gray-500'}`}>{schedule.day}</span>
              </div>
              
              <div className={`md:col-span-4 flex items-center space-x-2 transition-opacity ${!schedule.active ? 'opacity-50' : ''}`}>
                <input type="time" value={schedule.start} onChange={(e) => handleScheduleChange(index, 'start', e.target.value)} disabled={!schedule.active} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
                <span className="text-gray-500">até</span>
                <input type="time" value={schedule.end} onChange={(e) => handleScheduleChange(index, 'end', e.target.value)} disabled={!schedule.active} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
              </div>

              <div className={`md:col-span-5 flex items-center space-x-3 transition-opacity ${!schedule.active ? 'opacity-50' : ''}`}>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={schedule.hasBreak} onChange={(e) => handleScheduleChange(index, 'hasBreak', e.target.checked)} disabled={!schedule.active} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                  <span className={`text-sm ${schedule.hasBreak ? 'text-white' : 'text-gray-500'}`}>Intervalo</span>
                  <div className={`flex items-center space-x-2 transition-opacity ${!schedule.hasBreak ? 'opacity-0' : 'opacity-100'}`}>
                      <input type="time" value={schedule.breakStart} onChange={(e) => handleScheduleChange(index, 'breakStart', e.target.value)} disabled={!schedule.active || !schedule.hasBreak} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
                      <span className="text-gray-500">até</span>
                      <input type="time" value={schedule.breakEnd} onChange={(e) => handleScheduleChange(index, 'breakEnd', e.target.value)} disabled={!schedule.active || !schedule.hasBreak} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500" />
                  </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex justify-end pt-6">
        <button 
          onClick={validateAndSave}
          disabled={loading}
          className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;
