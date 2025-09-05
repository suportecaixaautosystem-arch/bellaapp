import React, { useState } from 'react';
import Card from '../../components/Card';
import { Save, Upload, Building, Percent, DollarSign } from 'lucide-react';

const CompanySettings: React.FC = () => {
  const [workingHours, setWorkingHours] = useState([
    { day: 'Segunda-feira', start: '08:00', end: '18:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Terça-feira', start: '08:00', end: '18:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Quarta-feira', start: '08:00', end: '18:00', active: true, hasBreak: true, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Quinta-feira', start: '08:00', end: '18:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Sexta-feira', start: '08:00', end: '18:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Sábado', start: '08:00', end: '16:00', active: true, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' },
    { day: 'Domingo', start: '10:00', end: '14:00', active: false, hasBreak: false, breakStart: '12:00', breakEnd: '13:00' }
  ]);
  
  const [allowDiscount, setAllowDiscount] = useState(true);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState('10');

  const [allowSurcharge, setAllowSurcharge] = useState(true);
  const [surchargeType, setSurchargeType] = useState<'fixed' | 'fixed'>('fixed');
  const [surchargeValue, setSurchargeValue] = useState('5');

  const handleScheduleChange = (index: number, field: string, value: any) => {
    const newWorkingHours = [...workingHours];
    (newWorkingHours[index] as any)[field] = value;
    setWorkingHours(newWorkingHours);
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Salão</label>
              <input
                type="text"
                defaultValue="BARBER & BELLA SALON"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">CPF / CNPJ</label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Telefone Comercial</label>
              <input
                type="tel"
                placeholder="(00) 0000-0000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
              />
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Regras de Venda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Discount Settings */}
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={allowDiscount} onChange={(e) => setAllowDiscount(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                    <span className="font-medium text-white">Permitir Descontos</span>
                </div>
                <div className={`space-y-2 transition-opacity ${allowDiscount ? 'opacity-100' : 'opacity-50'}`}>
                    <label className="block text-sm font-medium text-gray-400">Limite máximo de desconto</label>
                    <div className="flex">
                        <input type="text" value={discountValue} onChange={e => setDiscountValue(e.target.value)} disabled={!allowDiscount} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50" />
                        <div className="flex">
                            <button type="button" onClick={() => setDiscountType('percent')} disabled={!allowDiscount} className={`p-2 border border-l-0 ${discountType === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setDiscountType('fixed')} disabled={!allowDiscount} className={`p-2 border border-l-0 rounded-r-lg ${discountType === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Surcharge Settings */}
            <div className="space-y-4">
                <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={allowSurcharge} onChange={(e) => setAllowSurcharge(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                    </label>
                    <span className="font-medium text-white">Permitir Acréscimos</span>
                </div>
                <div className={`space-y-2 transition-opacity ${allowSurcharge ? 'opacity-100' : 'opacity-50'}`}>
                    <label className="block text-sm font-medium text-gray-400">Valor do acréscimo</label>
                     <div className="flex">
                        <input type="text" value={surchargeValue} onChange={e => setSurchargeValue(e.target.value)} disabled={!allowSurcharge} className="w-full bg-gray-800 border border-gray-700 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50" />
                        <div className="flex">
                            <button type="button" onClick={() => setSurchargeType('percent')} disabled={!allowSurcharge} className={`p-2 border border-l-0 ${surchargeType === 'percent' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><Percent className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setSurchargeType('fixed')} disabled={!allowSurcharge} className={`p-2 border border-l-0 rounded-r-lg ${surchargeType === 'fixed' ? 'bg-cyan-600 border-cyan-500' : 'bg-gray-700 border-gray-700 hover:bg-gray-600'}`}><DollarSign className="h-4 w-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-6 border-b border-gray-800 pb-4">Horários de Funcionamento</h2>
        <div className="space-y-4">
          {workingHours.map((schedule, index) => (
            <div key={index} className="p-4 border border-gray-800 rounded-lg bg-gray-950/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={schedule.active} onChange={(e) => handleScheduleChange(index, 'active', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                  <span className={`font-medium w-24 ${schedule.active ? 'text-white' : 'text-gray-500'}`}>{schedule.day}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={schedule.start}
                    onChange={(e) => handleScheduleChange(index, 'start', e.target.value)}
                    disabled={!schedule.active}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500"
                  />
                  <span className="text-gray-500">até</span>
                  <input
                    type="time"
                    value={schedule.end}
                    onChange={(e) => handleScheduleChange(index, 'end', e.target.value)}
                    disabled={!schedule.active}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white disabled:bg-gray-800/50 disabled:text-gray-500"
                  />
                </div>
              </div>
              {schedule.active && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center space-x-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={schedule.hasBreak} onChange={(e) => handleScheduleChange(index, 'hasBreak', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                  <span className={`font-medium ${schedule.hasBreak ? 'text-white' : 'text-gray-500'}`}>Fecha para intervalo?</span>
                  {schedule.hasBreak && (
                     <div className="flex items-center space-x-4">
                      <input
                        type="time"
                        value={schedule.breakStart}
                        onChange={(e) => handleScheduleChange(index, 'breakStart', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                      />
                      <span className="text-gray-500">até</span>
                      <input
                        type="time"
                        value={schedule.breakEnd}
                        onChange={(e) => handleScheduleChange(index, 'breakEnd', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex justify-end pt-6">
        <button className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-6 py-3 rounded-lg hover:from-sky-700 hover:to-cyan-600 transition-all duration-200 flex items-center space-x-2 shadow-lg">
          <Save className="h-5 w-5" />
          <span>Salvar Alterações</span>
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;
