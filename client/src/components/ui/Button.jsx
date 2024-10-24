import React from 'react';

export const Button = ({ onClick, children, className, disabled }) => {
    return (
        <button
            onClick={onClick}
            className={`p-2 text-white bg-blue-500 rounded-md disabled:opacity-50 ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
