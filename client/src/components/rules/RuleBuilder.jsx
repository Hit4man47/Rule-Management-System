import React, { useState, useEffect } from 'react';
import { PlusCircle, GripVertical, Trash2 } from 'lucide-react';
import { getAttributes, createRule } from '../../services/api';

const operators = ['=', '!=', '<', '>', '>=', '<=', 'Contains', 'Is In'];
const linkTypes = ['AND', 'OR', 'NOT'];
const linkStyles = { AND: 'bg-blue-500', OR: 'bg-orange-500', NOT: 'bg-red-500' };

const Condition = ({
    condition,
    index,
    updateCondition,
    deleteCondition,
    onDragStart,
    onDragOver,
    onDrop,
    fields,
    attributes
}) => {
    const currentAttribute = attributes.find(attr => attr.name === condition.field);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e)}
            onDrop={(e) => onDrop(e, index)}
            className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow mb-2 w-full"
            style={{ minWidth: '700px' }}
        >
            <GripVertical className="text-gray-400 cursor-move" />
            <select
                value={condition.field}
                onChange={(e) => updateCondition(index, 'field', e.target.value)}
                className="border rounded p-1 text-sm flex-grow"
                style={{ flexBasis: '25%' }}
            >
                {fields.map(field => <option key={field} value={field}>{field}</option>)}
            </select>
            <select
                value={condition.operator}
                onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                className="border rounded p-1 text-sm flex-grow"
                style={{ flexBasis: '10%', borderLeft: '1px solid #e2e8f0' }}
            >
                {operators.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
            {currentAttribute && currentAttribute.allowedValues.length > 0 ? (
                <select
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="border rounded p-1 text-sm flex-grow"
                    style={{ flexBasis: '25%' }}
                >
                    {currentAttribute.allowedValues.map(value => (
                        <option key={value} value={value}>{value}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={currentAttribute && currentAttribute.type === 'number' ? 'number' : 'text'}
                    value={condition.value}
                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    className="border rounded p-1 text-sm flex-grow"
                    placeholder="Value"
                    style={{ flexBasis: '25%' }}
                />
            )}
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                <Trash2 className="text-gray-400 cursor-pointer" onClick={() => deleteCondition(index)} />
            </div>
        </div>
    );
};

const ConditionGroup = ({
    group,
    groupIndex,
    updateGroup,
    deleteGroup,
    fields,
    attributes
}) => {
    const onDragStart = (e, index) => {
        e.dataTransfer.setData('text/plain', index);
    };
    const onDragOver = (e) => {
        e.preventDefault();
    };
    const onDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('text'));
        const newConditions = [...group.conditions];
        const [removed] = newConditions.splice(dragIndex, 1);
        newConditions.splice(dropIndex, 0, removed);
        updateGroup(groupIndex, { ...group, conditions: newConditions });
    };

    const deleteCondition = (conditionIndex) => {
        const newConditions = [...group.conditions];
        newConditions.splice(conditionIndex, 1);
        updateGroup(groupIndex, { ...group, conditions: newConditions });
    };

    return (
        <div className="mb-4 relative">
            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${linkStyles[group.link]}`}></div>
            <div className="pl-6">
                {group.conditions.map((condition, index) => (
                    <Condition
                        key={index}
                        condition={condition}
                        index={index}
                        updateCondition={(index, key, value) => {
                            const newConditions = [...group.conditions];
                            newConditions[index] = { ...newConditions[index], [key]: value };
                            updateGroup(groupIndex, { ...group, conditions: newConditions });
                        }}
                        deleteCondition={deleteCondition}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        fields={fields}
                        attributes={attributes}
                    />
                ))}
                <button
                    onClick={() => {
                        const newConditions = [...group.conditions, { field: fields[0], operator: operators[0], value: '' }];
                        updateGroup(groupIndex, { ...group, conditions: newConditions });
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm ml-8"
                >
                    + Add Condition
                </button>
                <Trash2 className="text-gray-400 cursor-pointer" onClick={() => deleteGroup(groupIndex)} />
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full pr-2">
                <select
                    value={group.link}
                    onChange={(e) => updateGroup(groupIndex, { ...group, link: e.target.value })}
                    className={`font-bold text-white rounded px-2 py-1 ${linkStyles[group.link]}`}
                >
                    {linkTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const RuleBuilder = () => {
    const [ruleName, setRuleName] = useState('');
    const [groups, setGroups] = useState([]);
    const [fields, setFields] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [jsonData, setJsonData] = useState('');
    const [isJsonMode, setIsJsonMode] = useState(false);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                setIsLoading(true);
                const response = await getAttributes();
                setAttributes(response.attributes || []);
                const fieldNames = response.attributes.map(attr => attr.name);
                setFields(fieldNames);
                if (fieldNames.length > 0) {
                    setGroups([{
                        link: 'AND',
                        conditions: [{ field: fieldNames[0], operator: '=', value: '' }],
                        groupLink: '' 
                    }]);
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching attributes:', error);
                setError('Failed to fetch attributes. Please try again later.');
                setIsLoading(false);
            }
        };
        fetchFields();
    }, []);

    const updateGroup = (index, newGroup) => {
        setGroups(prevGroups => {
            const newGroups = [...prevGroups];
            newGroups[index] = newGroup;
            return newGroups;
        });
    };

    const deleteGroup = (index) => {
        setGroups(prevGroups => {
            const newGroups = [...prevGroups];
            newGroups.splice(index, 1);

            if (index > 0 && index < newGroups.length) {
                newGroups[index - 1].groupLink = newGroups[index].groupLink || '';
            } else if (index > 0 && index === newGroups.length) {
                newGroups[index - 1].groupLink = '';
            }

            return newGroups;
        });
    };

    const addGroup = () => {
        if (fields.length === 0) return;

        setGroups(prevGroups => {
            const updatedGroups = [...prevGroups];
            if (updatedGroups.length > 0) {
                const lastGroup = updatedGroups[updatedGroups.length - 1];
                if (!lastGroup.groupLink) {
                    lastGroup.groupLink = 'AND'; 
                }
            }
            updatedGroups.push({
                link: 'AND',
                conditions: [{ field: fields[0], operator: '=', value: '' }],
                groupLink: '' 
            });
            return updatedGroups;
        });
    };

    const exportRules = () => {
        if (groups.length === 0) return '';

        let ruleString = '';

        groups.forEach((group, index) => {
            const conditions = group.conditions.map(condition => {
                const operator = condition.operator;
                const value = typeof condition.value === 'string' && condition.value !== ''
                    ? `'${condition.value}'`
                    : condition.value;
                return `${condition.field} ${operator} ${value}`;
            }).join(` ${group.link} `);

            const wrappedConditions = group.conditions.length > 1 ? `(${conditions})` : conditions;

            if (index > 0 && groups[index - 1].groupLink) {
                ruleString += ` ${groups[index - 1].groupLink} `;
            }

            ruleString += wrappedConditions;
        });

        return ruleString;
    };

    const handleCreateRule = async () => {
        if (!ruleName) {
            alert("Please enter a rule name");
            return;
        }
        const ruleString = exportRules();
        try {
            await createRule(ruleName, ruleString);
            alert("Rule created successfully");
        } catch (error) {
            console.error("Error creating rule:", error);
            alert("Failed to create rule");
        }
    };


    const handleJsonChange = (e) => {
        setJsonData(e.target.value);
    };

    const handleTabSwitch = (mode) => {
        if (mode === 'json') {
            const jsonFormatted = JSON.stringify({ rules: groups }, null, 4);
            setJsonData(jsonFormatted);
        } else {
            try {
                const parsedJson = JSON.parse(jsonData);
                setGroups(parsedJson.rules);
            } catch (error) {
                alert("Invalid JSON format. Please correct and try again.");
            }
        }
        setIsJsonMode(mode === 'json');
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mx-auto" style={{ maxWidth: '900px', width: '900px' }}>
            <h2 className="text-xl font-bold mb-4">CONDITIONS</h2>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => handleTabSwitch('normal')}
                    className={`px-4 py-2 rounded ${!isJsonMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    Normal Entry
                </button>
                <button
                    onClick={() => handleTabSwitch('json')}
                    className={`px-4 py-2 rounded ${isJsonMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                    JSON Entry
                </button>
            </div>

            {!isJsonMode ? (
                <>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Rule Name</label>
                        <input
                            type="text"
                            value={ruleName}
                            onChange={(e) => setRuleName(e.target.value)}
                            className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                            placeholder="Enter rule name"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow mb-4" style={{ width: '100%' }}>
                        {groups.map((group, index) => (
                            <div key={index} style={{ marginLeft: '70px' }}>
                                <ConditionGroup
                                    group={group}
                                    groupIndex={index}
                                    updateGroup={updateGroup}
                                    deleteGroup={deleteGroup}
                                    fields={fields}
                                    attributes={attributes}
                                />
                                {index < groups.length - 1 && (
                                    <div className="text-center mt-4">
                                        <select
                                            value={groups[index].groupLink || 'AND'}
                                            onChange={(e) => updateGroup(index, { ...groups[index], groupLink: e.target.value })}
                                            className={`font-bold text-white rounded px-2 py-1 ${linkStyles[groups[index].groupLink]}`}
                                            style={{ maxWidth: '100%', overflow: 'hidden' }}
                                        >
                                            {linkTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={addGroup}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusCircle className="mr-2" size={16} />
                            Add Action
                        </button>
                    </div>
                </>
            ) : (
                <div className="mb-4" style={{ width: '100%' }}>
                    <label className="block text-sm font-medium text-gray-700">Edit JSON</label>
                    <textarea
                        value={jsonData}
                        onChange={handleJsonChange}
                        rows={10}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        style={{ minHeight: '400px', maxHeight: '600px', overflowY: 'auto', width: '100%' }}
                    />
                </div>
            )}

            <div className="bg-white p-4 my-4 rounded-lg shadow">
                <h4 className="text-lg font-bold mb-2">Rule Preview</h4>
                <pre>{exportRules()}</pre>
            </div>

            <button
                onClick={handleCreateRule}
                disabled={isSubmitting}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                {isSubmitting ? 'Creating Rule...' : 'Create Rule'}
            </button>
        </div>
    );
};

export default RuleBuilder;
