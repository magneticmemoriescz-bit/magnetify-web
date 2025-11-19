
import React from 'react';

export const FormInput = ({ name, label, error, value, onChange, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input 
            id={name} 
            name={name} 
            {...props} 
            value={value}
            onChange={onChange}
            className={`block w-full rounded-md shadow-sm py-2.5 px-3 sm:text-sm transition-colors bg-white
            ${error 
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 text-dark-gray focus:ring-brand-primary focus:border-brand-primary'
            } border`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);
