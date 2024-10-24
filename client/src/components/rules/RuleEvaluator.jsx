import React, { useState, useEffect } from 'react';
import { getRules, evaluateRule } from '../../services/api';

const RuleEvaluator = () => {
    const [rules, setRules] = useState([]);
    const [selectedRule, setSelectedRule] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingRules, setIsLoadingRules] = useState(true);
    const [rulesError, setRulesError] = useState('');

    useEffect(() => {
        const fetchRules = async () => {
            try {
                setIsLoadingRules(true);
                const response = await getRules();
                const fetchedRules = response.rules;
                if (Array.isArray(fetchedRules)) {
                    setRules(fetchedRules);
                } else {
                    setRulesError('Failed to fetch rules. Invalid response format.');
                }
            } catch (error) {
                console.error('Error fetching rules:', error);
                setRulesError('Error fetching rules. Please try again.');
            } finally {
                setIsLoadingRules(false);
            }
        };
        fetchRules();
    }, []);

    const handleEvaluateRule = async () => {
        try {
            setError('');
            setIsSubmitting(true);

            // Validate rule selection
            if (!selectedRule) {
                setError('Please select a rule.');
                setIsSubmitting(false);
                return;
            }

            let data;
            try {
                data = JSON.parse(jsonData);
                if (!Array.isArray(data)) {
                    data = [data];
                }
            } catch (e) {
                setError('Invalid JSON format. Please check your input.');
                setIsSubmitting(false);
                return;
            }
            const evaluationResults = await Promise.all(
                data.map(async (entry) => {
                    const response = await evaluateRule(selectedRule, { userData: entry });
                    return {
                        entry,
                        result: response.result ? 'Pass' : 'Fail'
                    };
                })
            );

            const formattedResults = evaluationResults.map((res, index) => ({
                TestCase: index + 1,
                Data: res.entry,
                Result: res.result
            }));

            setResult(JSON.stringify(formattedResults, null, 2));
        } catch (error) {
            console.error('Error evaluating rule:', error);

            if (error.response) {
                if (error.response.status === 404) {
                    setError('Rule not found. Please select a different rule.');
                } else {
                    setError(`Server error: ${error.response.data.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                setError('No response from server. Please check if the server is running.');
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mx-auto" style={{ width: 900, maxWidth: '90vw' }}>
            <h2 className="text-xl font-bold mb-4">Rule Evaluator</h2>
            <div className="mb-4">
                <label htmlFor="rule-select" className="block text-sm font-medium text-gray-700">
                    Select a Rule:
                </label>
                {isLoadingRules ? (
                    <div>Loading rules...</div>
                ) : rulesError ? (
                    <div className="text-red-500">{rulesError}</div>
                ) : (
                    <select
                        id="rule-select"
                        value={selectedRule}
                        onChange={(e) => setSelectedRule(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                        <option value="">Select a rule</option>
                        {rules.map((rule) => (
                            <option key={rule._id} value={rule._id}>{rule.name}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="mb-4">
                <label htmlFor="json-input" className="block text-sm font-medium text-gray-700">
                    JSON Data:
                </label>
                <textarea
                    id="json-input"
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder='Enter JSON data, e.g., {"age": 30, "department": "Sales"}'
                />
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <button
                onClick={handleEvaluateRule}
                disabled={isSubmitting}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-50' : ''}`}
            >
                {isSubmitting ? 'Evaluating...' : 'Submit'}
            </button>
            <div className="bg-white p-4 rounded-lg shadow mb-4 mt-4">
                <h3 className="text-lg font-bold">Results: </h3>
                <pre style={{ backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                    {result && JSON.parse(result).map((test, index) => (
                        <div key={index}>
                            <strong>Test Case {test.TestCase}:</strong>
                            <div>Data: {JSON.stringify(test.Data)}</div>
                            <div style={{ color: test.Result === 'Pass' ? '#2ca02c' : '#ff0000' }}>Result: {test.Result}</div>
                            <hr />
                        </div>
                    ))}
                </pre>
            </div>
        </div>
    );
};

export default RuleEvaluator;
