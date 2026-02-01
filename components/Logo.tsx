import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <img 
            src="https://i.imgur.com/b4WFqRi.png" 
            alt="Magnetic Memories" 
            className={`h-16 md:h-24 w-auto object-contain ${className || ''}`} 
        />
    );
};
