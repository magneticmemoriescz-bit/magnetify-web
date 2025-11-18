import React from 'react';

export const RadioCard = ({ name, value, checked, onChange, title, price }: any) => (
    <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${checked ? 'bg-blue-50 border-brand-primary ring-1 ring-brand-primary' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="h-4 w-4 text-brand-primary border-gray-300 focus:ring-brand-primary" />
        <div className="ml-3 flex-1 flex justify-between">
            <span className={`font-medium ${checked ? 'text-brand-navy' : 'text-gray-900'}`}>{title}</span>
            <span className={`text-sm ${checked ? 'text-brand-primary font-bold' : 'text-gray-500'}`}>{price}</span>
        </div>
    </label>
);