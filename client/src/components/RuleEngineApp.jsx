import React, { useState } from 'react';
import RuleBuilder from './rules/RuleBuilder';
import RuleEvaluator from './rules/RuleEvaluator';
import RuleManager from './rules/RuleManager';

export const RuleEngineApp = () => {
    const [tab, setTab] = useState('builder');

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 rule-container">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-gray-100">Rule Engine Dashboard</h1>
                <p className="text-gray-500">Manage and evaluate business rules with ease</p>
            </header>
            <div className="border-b border-gray-300">
                <div className="flex justify-center space-x-1" role="tablist">
                    <button
                        onClick={() => setTab('builder')}
                        className={`py-2 px-4 text-sm font-medium text-center rounded-t-lg border-b-2
                        ${tab === 'builder' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                        role="tab"
                    >
                        Build
                    </button>
                    <button
                        onClick={() => setTab('evaluate')}
                        className={`py-2 px-4 text-sm font-medium text-center rounded-t-lg border-b-2
                        ${tab === 'evaluate' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                        role="tab"
                    >
                        Evaluate
                    </button>
                    <button
                        onClick={() => setTab('manage')}
                        className={`py-2 px-4 text-sm font-medium text-center rounded-t-lg border-b-2
                        ${tab === 'manage' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}`}
                        role="tab"
                    >
                        Manage
                    </button>
                </div>
            </div>
            <div className="pt-4">
                {tab === 'builder' && <RuleBuilder />}
                {tab === 'evaluate' && <RuleEvaluator />}
                {tab === 'manage' && <RuleManager />}
            </div>
        </div >
    );
};

export default RuleEngineApp;