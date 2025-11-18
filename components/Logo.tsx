
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <img 
            src="https://i.imgur.com/wMndDuj.png" 
            alt="Magnetify.cz" 
            className={`h-16 md:h-24 w-auto object-contain ${className || ''}`} 
        />
    );
};
