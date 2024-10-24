import React from 'react';

export const Card = ({ children }) => {
    return (
        <div className="max-w-md mx-auto p-4 shadow-lg rounded-lg bg-white">
            {children}
        </div>
    );
};

export const CardHeader = ({ children }) => {
    return (
        <div className="mb-4">
            {children}
        </div>
    );
};

export const CardTitle = ({ children }) => {
    return (
        <h2 className="text-xl font-bold">{children}</h2>
    );
};

export const CardDescription = ({ children }) => {
    return (
        <p className="text-sm text-gray-600">{children}</p>
    );
};

export const CardContent = ({ children, className }) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {children}
        </div>
    );
};