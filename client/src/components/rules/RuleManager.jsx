import React, { useState, useEffect, useMemo } from 'react';
import { getRules, getRuleAST, updateRule, getAttributes, createRule } from '../../services/api';
import { PlusCircle, GripVertical, Trash2, AlertTriangle } from 'lucide-react';

const logicalOperators = ['AND', 'OR'];
const operators = ['=', '!=', '<', '>', '>=', '<=', 'Contains', 'Is In'];
const linkTypes = ['AND', 'OR', 'NOT'];
const linkStyles = { AND: 'bg-blue-500', OR: 'bg-orange-500', NOT: 'bg-red-500' };

const findOperandNodeWithPath = (ast, field, path = []) => {
    if (!ast) return null;

    const currentNode = { ...ast, nodePath: [...path] };

    if (ast.type === 'operator') {
        if (ast.left?.value === field && ast.right?.type === 'operand') {
            return {
                node: ast.right,
                path: [...path, 'right']
            };
        }
        const leftResult = findOperandNodeWithPath(ast.left, field, [...path, 'left']);
        if (leftResult) return leftResult;
        const rightResult = findOperandNodeWithPath(ast.right, field, [...path, 'right']);
        if (rightResult) return rightResult;
    }
    return null;
};

const createNodeMap = (ast) => {
    const nodeMap = new Map();
    const traverse = (node, parentOp = null) => {
        if (!node) return;
        if (node.type === 'operator') {
            if (node.left?.type === 'operand' && node.right?.type === 'operand') {
                const fieldName = node.left.value;
                const uniqueKey = `${fieldName}-${node._id}`;
                nodeMap.set(uniqueKey, {
                    operatorNode: node,
                    valueNode: node.right,
                    fieldName: fieldName,
                    operatorId: node._id,
                    valueNodeId: node.right._id,
                    fieldNodeId: node.left._id
                });
            }
            traverse(node.left, node);
            traverse(node.right, node);
        }
    };
    traverse(ast);
    return nodeMap;
};

const RuleManager = () => {
    const [rules, setRules] = useState([]);
    const [selectedRule, setSelectedRule] = useState(null);
    const [ruleString, setRuleString] = useState('');
    const [rulePreview, setRulePreview] = useState(''); 
    const [ast, setAst] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAST, setShowAST] = useState(false);
    const [attributes, setAttributes] = useState([]);
    const [editedValues, setEditedValues] = useState({});

    const [rule1, setRule1] = useState('');
    const [rule2, setRule2] = useState('');
    const [operator, setOperator] = useState('AND');
    const [combinedRuleName, setCombinedRuleName] = useState('');
    const [combinedRulePreview, setCombinedRulePreview] = useState('');
    const [rule1AST, setRule1AST] = useState(null);
    const [rule2AST, setRule2AST] = useState(null);
    const [rule1Preview, setRule1Preview] = useState('');
    const [rule2Preview, setRule2Preview] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rulesResponse, attributesResponse] = await Promise.all([
                    getRules(),
                    getAttributes(),
                ]);
                setRules(rulesResponse.rules || rulesResponse);
                setAttributes(attributesResponse.attributes || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleRuleSelect = async (rule) => {
        setSelectedRule(rule);
        setRuleString(rule.ruleString);
        setShowAST(false); 
        try {
            const response = await getRuleAST(rule._id);
            const fetchedAST = response.ast;
            setAst(fetchedAST);
            const parsedGroup = parseBackendASTToGroup(fetchedAST);
            const generatedRuleString = exportRules([parsedGroup]);
            setRulePreview(generatedRuleString);
        } catch (error) {
            console.error('Error fetching AST:', error);
        }
    };

    const handleRule1Select = async (rule1) => {
        setRule1(rule1); 
        try {
            const response = await getRuleAST(rule1._id);
            const fetchedAST = response.ast;
            setRule1AST(fetchedAST);

            const parsedGroup = parseBackendASTToGroup(fetchedAST);
            const generatedRuleString = exportRules([parsedGroup]);
            setRule1Preview(generatedRuleString); 
        } catch (error) {
            console.error('Error fetching Rule 1 AST:', error);
        }
    };

    const handleRule2Select = async (rule2) => {
        setRule2(rule2); 
        try {
            const response = await getRuleAST(rule2._id);
            const fetchedAST = response.ast;
            setRule2AST(fetchedAST);
            const parsedGroup = parseBackendASTToGroup(fetchedAST);
            const generatedRuleString = exportRules([parsedGroup]);
            setRule2Preview(generatedRuleString); 
        } catch (error) {
            console.error('Error fetching Rule 2 AST:', error);
        }
    };

    useEffect(() => {
    
        if (rule1Preview && rule2Preview) {
            const previewContent = (
                <span>
                    (<span style={{ color: 'blue' }}>{rule1Preview}</span> {operator} <span style={{ color: 'green' }}>{rule2Preview}</span>)
                </span>
            );
    
            setCombinedRulePreview(previewContent);
        } else {
            setCombinedRulePreview('');
        }
    }, [rule1Preview, rule2Preview, operator]);
    


    const handleCreateCombinedRule = async () => {
        if (!combinedRuleName || !rule1 || !rule2) {
            alert("Please select both rules and provide a name.");
            return;
        }

        const combinedRuleString = `( ${rule1Preview} ${operator} ${rule2Preview} )`;

        try {
            await createRule(combinedRuleName, combinedRuleString);
            alert('Combined rule created successfully');

            const rulesResponse = await getRules();
            setRules(rulesResponse.rules || []);
            setRule1('');
            setRule2('');
            setRule1Preview('');
            setRule2Preview('');
            setRule1AST(null);
            setRule2AST(null);
            setCombinedRuleName('');
            setCombinedRulePreview('');
        } catch (error) {
            console.error('Error creating combined rule:', error);
            alert('Failed to create combined rule');
        }
    };

    const parseBackendASTToGroup = (node) => {
        if (!node) return null;
        if (node.type === 'operator') {
            const operator = node.operator;
            if (logicalOperators.includes(operator)) {
                const group = {
                    link: operator,
                    conditions: [],
                    groups: [],
                };
                const leftGroup = parseBackendASTToGroup(node.left);
                const rightGroup = parseBackendASTToGroup(node.right);
                if (leftGroup) {
                    group.groups.push(leftGroup);
                }
                if (rightGroup) {
                    group.groups.push(rightGroup);
                }
                return group;
            } else if (operators.includes(operator)) {
                const fieldNode = node.left;
                const valueNode = node.right;
                let field = fieldNode.value;
                let value = valueNode.value;
                return {
                    link: '',
                    conditions: [
                        {
                            field: field,
                            operator: operator,
                            value: value,
                        },
                    ],
                    groups: [],
                };
            }
        }

        return null;
    };

    const exportGroup = (group) => {
        if (!group) return '';

        const conditionsStr = group.conditions
            .map((condition) => {
                const operator = condition.operator;
                const value =
                    typeof condition.value === 'string'
                        ? `'${condition.value}'`
                        : condition.value;
                return `${condition.field} ${operator} ${value}`;
            })
            .join(` ${group.link} `);

        const groupsStr =
            group.groups && group.groups.length > 0
                ? group.groups.map((subgroup) => exportGroup(subgroup)).join(` ${group.link} `)
                : '';

        let combinedStr = [conditionsStr, groupsStr].filter(Boolean).join(` ${group.link} `);

        const needsParentheses = group.link && (group.conditions.length + group.groups.length) > 1;

        if (needsParentheses) {
            combinedStr = `(${combinedStr})`;
        }

        return combinedStr;
    };

    const exportRules = (groups) => {
        if (!groups || groups.length === 0) return '';

        return groups
            .map((group) => exportGroup(group))
            .join(' AND '); 
    };

    const handleUpdateRule = async () => {
        if (!selectedRule || !ast) {
            alert('No rule selected');
            return;
        }

        try {
            const updatesArray = Object.entries(editedValues).map(([nodeId, data]) => {
                const nodeExists = findNodeInAST(ast, nodeId);
                if (!nodeExists) {
                    console.warn(`Node ${nodeId} not found in AST`);
                    return null;
                }
                return {
                    nodeId,
                    value: data.value.toString(),
                    operatorId: data.operatorId
                };
            }).filter(Boolean); 
            if (updatesArray.length === 0) {
                alert('No valid changes to save');
                return;
            }
            const response = await updateRule(selectedRule._id, updatesArray);
            const [rulesResponse, astResponse] = await Promise.all([
                getRules(),
                getRuleAST(selectedRule._id)
            ]);
            setRules(rulesResponse.rules || rulesResponse);
            setAst(astResponse.ast);
            const parsedGroup = parseBackendASTToGroup(astResponse.ast);
            const generatedRuleString = exportRules([parsedGroup]);
            setRulePreview(generatedRuleString);

            setEditedValues({});
            setIsEditing(false);
            alert('Rule updated successfully!');
        } catch (error) {
            console.error('Error updating rule:', error);
            alert(`Failed to update rule: ${error.message}`);
        }
    };

    const findNodeInAST = (ast, targetNodeId) => {
        if (!ast) return false;
        if (ast._id === targetNodeId) {
            return true;
        }
        if (ast.type === 'operator') {
            return findNodeInAST(ast.left, targetNodeId) || findNodeInAST(ast.right, targetNodeId);
        }

        return false;
    };



    const extractUpdatedValues = (astNode) => {
        if (!astNode) return [];
        const updatedValues = [];
        const nodeId = astNode._id || astNode.nodeId || astNode.id;
        if (astNode.type === 'operand') {
            updatedValues.push({ nodeId, value: astNode.value });  
        }
        if (astNode.left) {
            updatedValues.push(...extractUpdatedValues(astNode.left));  
        }
        if (astNode.right) {
            updatedValues.push(...extractUpdatedValues(astNode.right));  
        }
        return updatedValues;
    };

    const openEditInterface = () => {
        setIsEditing(true);
    };

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mx-auto" style={{ maxWidth: '900px', width: '900px' }}>
            <h2 className="text-xl font-bold mb-4">Manage Rules</h2>

            <div className="flex">
                <div className="w-1/3 bg-white p-4 rounded-lg shadow mr-4">
                    <h3 className="text-lg font-bold">Saved Rules</h3>
                    <ul>
                        {rules && rules.length > 0 ? (
                            rules.map((rule, index) => (
                                <li key={index} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => handleRuleSelect(rule)}>
                                    {rule.name}
                                </li>
                            ))
                        ) : (
                            <p>No rules available.</p>
                        )}
                    </ul>
                </div>

                <div className="w-2/3 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-bold">Rule Details</h3>
                    {selectedRule ? (
                        <>
                            <div className="mb-4">
                                <h4 className="font-semibold">Rule Preview:</h4>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{rulePreview}</pre>
                                <button
                                    onClick={() => setShowAST(!showAST)}
                                    className="px-2 py-1 bg-gray-300 text-gray-800 rounded mt-2"
                                >
                                    {showAST ? 'Hide AST' : 'Show AST'}
                                </button>
                                {showAST && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold">AST Preview:</h4>
                                        <pre>{JSON.stringify(ast, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={openEditInterface}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mt-4"
                            >
                                Edit Rule
                            </button>
                        </>
                    ) : (
                        <p>Select a rule to view details.</p>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold mb-4">Combine New Rules</h3>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Combined Rule Name</label>
                    <input
                        type="text"
                        value={combinedRuleName}
                        onChange={(e) => setCombinedRuleName(e.target.value)}
                        placeholder="Enter combined rule name"
                        className="mt-1 block w-full border rounded p-1 text-sm"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Select Rule 1</label>
                    <select
                        value={rule1 ? rule1._id : ''}
                        onChange={(e) => {
                            const selectedRule = rules.find(rule => rule._id === e.target.value);
                            handleRule1Select(selectedRule);
                        }}
                        className="mt-1 block w-full border rounded p-1 text-sm"
                    >
                        <option value="">Select a rule</option>
                        {rules.map((rule) => (
                            <option key={rule._id} value={rule._id}>
                                {rule.name}
                            </option>
                        ))}
                    </select>

                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Operator</label>
                    <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        className="mt-1 block w-full border rounded p-1 text-sm"
                    >
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                        <option value="NOT">NOT</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Select Rule 2</label>
                    <select
                        value={rule2 ? rule2._id : ''}
                        onChange={(e) => {
                            const selectedRule = rules.find(rule => rule._id === e.target.value);
                            handleRule2Select(selectedRule);
                        }}
                        className="mt-1 block w-full border rounded p-1 text-sm"
                    >
                        <option value="">Select a rule</option>
                        {rules.map((rule) => (
                            <option key={rule._id} value={rule._id}>
                                {rule.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <h4 className="font-semibold text-gray-700">Combined Rule Preview:</h4>
                    <div className="bg-gray-100 p-3 rounded text-sm">
                        {combinedRulePreview || 'No combined preview available'}
                    </div>
                </div>


                <button
                    onClick={handleCreateCombinedRule}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Create Combined Rule
                </button>
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
                        <h3 className="text-lg font-bold mb-4">Edit Rule - {selectedRule?.name}</h3>
                        <RuleEditor
                            initialRuleString={ruleString}
                            initialAST={ast}
                            attributes={attributes}
                            editedValues={editedValues}
                            setEditedValues={setEditedValues}
                            onSave={handleUpdateRule}
                            onCancel={() => {
                                setIsEditing(false);
                                setEditedValues({});
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const Condition = ({
    condition,
    index,
    updateCondition,
    fields,
    attributes,
    ast,
    onAstUpdate,
    editedValues,
    setEditedValues,
    readOnly = false
}) => {
    const currentAttribute = attributes.find((attr) => attr.name === condition.field);
    const [nodeMap] = useState(() => createNodeMap(ast));
    const [associatedNodeInfo, setAssociatedNodeInfo] = useState(null);
    const findUniqueNode = () => {
        const entries = Array.from(nodeMap.entries());
        let matchingEntry = entries.find(([key, data]) => {
            const originalValue = data.valueNode.value;
            const currentValue = editedValues[data.valueNode._id]?.value;
            return data.fieldName === condition.field &&
                (originalValue === condition.value || currentValue === condition.value) &&
                data.operatorNode && data.valueNode;
        });
        if (!matchingEntry) {
            matchingEntry = entries.find(([key, data]) => {
                return data.fieldName === condition.field &&
                    data.operatorNode && data.valueNode &&
                    !Object.keys(editedValues).includes(data.valueNode._id);
            });
        }
        if (matchingEntry) {
            const [key, data] = matchingEntry;
            return {
                nodeId: data.valueNode._id,
                originalValue: data.valueNode.value,
                operatorId: data.operatorNode._id
            };
        }

        return null;
    };
    useEffect(() => {
        if (!associatedNodeInfo) {
            const nodeInfo = findUniqueNode();
            setAssociatedNodeInfo(nodeInfo);
        }
    }, []);

    const value = associatedNodeInfo?.nodeId && editedValues[associatedNodeInfo.nodeId]?.value !== undefined
        ? editedValues[associatedNodeInfo.nodeId].value
        : condition.value;

    const handleValueChange = (e) => {
        const newValue = e.target.value;

        if (!associatedNodeInfo?.nodeId) {
            console.warn(`Could not find unique node for field: ${condition.field}`);
            return;
        }
        setEditedValues(prev => {
            const updatedValues = {
                ...prev,
                [associatedNodeInfo.nodeId]: {
                    value: newValue,
                    originalValue: associatedNodeInfo.originalValue,
                    operatorId: associatedNodeInfo.operatorId
                }
            };
            return updatedValues;
        });

        updateCondition(index, 'value', newValue);
    };

    const displayValue = associatedNodeInfo?.nodeId && editedValues[associatedNodeInfo.nodeId]?.value !== undefined
    ? editedValues[associatedNodeInfo.nodeId].value
    : condition.value;

    return (
        <div className="flex flex-wrap items-center bg-white p-2 rounded-lg shadow mb-2 w-full">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                    {condition.field}
                    <span className="text-xs text-gray-500 ml-2">
                        (Node: {associatedNodeInfo?.nodeId?.substring(0, 6)}...)
                    </span>
                </label>
                {currentAttribute && currentAttribute.allowedValues &&
                    currentAttribute.allowedValues.length > 0 ? (
                    <select
                        value={value}
                        onChange={handleValueChange}
                        className="mt-1 block w-full border rounded p-1 text-sm"
                        disabled={readOnly}
                    >
                        {currentAttribute.allowedValues.map((val) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={currentAttribute && currentAttribute.type === 'number' ?
                            'number' : 'text'}
                        value={displayValue}
                        onChange={handleValueChange}
                        className="mt-1 block w-full border rounded p-1 text-sm"
                        placeholder="Enter value"
                        disabled={readOnly}
                    />
                )}
            </div>
        </div>
    );
};


const ConditionGroup = ({
    group,
    updateGroup,
    fields,
    attributes,
    ast,
    onAstUpdate,
    editedValues,
    setEditedValues,
    parentPath = []
}) => {
    const updateCondition = (index, key, value) => {
        const newConditions = [...group.conditions];
        newConditions[index] = { ...newConditions[index], [key]: value };
        updateGroup({ ...group, conditions: newConditions });
    };

    return (
        <div>
            {group.conditions.map((condition, index) => (
                <Condition
                    key={index}
                    condition={condition}
                    index={index}
                    updateCondition={updateCondition}
                    fields={fields}
                    attributes={attributes}
                    ast={ast}
                    onAstUpdate={onAstUpdate}
                    editedValues={editedValues}
                    setEditedValues={setEditedValues}
                    parentPath={[...parentPath, `conditions`, index.toString()]}
                />
            ))}
            {group.groups && group.groups.map((subGroup, idx) => (
                <ConditionGroup
                    key={idx}
                    group={subGroup}
                    updateGroup={(newSubGroup) => {
                        const newGroups = [...group.groups];
                        newGroups[idx] = newSubGroup;
                        updateGroup({ ...group, groups: newGroups });
                    }}
                    fields={fields}
                    attributes={attributes}
                    ast={ast}
                    onAstUpdate={onAstUpdate}
                    editedValues={editedValues}
                    setEditedValues={setEditedValues}
                    parentPath={[...parentPath, `groups`, idx.toString()]}
                />
            ))}
        </div>
    );
};


const RuleEditor = ({
    initialRuleString,
    initialAST,
    attributes = [],
    editedValues,
    setEditedValues,
    onSave,
    onCancel
}) => {
    const [ruleName, setRuleName] = useState('');
    const [group, setGroup] = useState(null);
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentAST, setCurrentAST] = useState(initialAST);

    const parseASTToGroup = (node) => {
        if (!node) return null;

        if (node.type === 'operator' && operators.includes(node.operator)) {
            return {
                conditions: [
                    {
                        field: node.left.value,
                        operator: node.operator,
                        value: node.right.value,
                        nodeId: node._id,
                    },
                ],
                groups: [],
            };
        } else if (node.type === 'operator') {
            return {
                conditions: [],
                groups: [parseASTToGroup(node.left), parseASTToGroup(node.right)].filter(Boolean),
            };
        }
        return null;
    };

    useEffect(() => {
        if (!attributes || attributes.length === 0) {
            return;
        }
        try {
            setIsLoading(true);
            const fieldNames = attributes.map((attr) => attr.name);
            setFields(fieldNames);
            setRuleName(initialRuleString || '');

            if (initialAST) {
                const parsedGroup = parseASTToGroup(initialAST);
                setGroup(parsedGroup);
            } else {
                setGroup({
                    conditions: [{ field: fieldNames[0], operator: operators[0], value: '' }],
                    groups: [],
                });
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error initializing data:', error);
            setIsLoading(false);
        }
    }, [initialRuleString, initialAST, attributes]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="text-xl font-bold mb-4">Edit Rule</h2>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p className="text-sm">Only values can be edited. Conditions and rules cannot be changed.</p>
            </div>

            <div
                className="bg-white p-4 rounded-lg shadow mb-4"
                style={{ maxHeight: '400px', overflowY: 'auto' }}
            >
                {group && (
                    <ConditionGroup
                        group={group}
                        updateGroup={setGroup}
                        fields={fields}
                        attributes={attributes}
                        ast={currentAST}
                        onAstUpdate={setCurrentAST}
                        editedValues={editedValues}
                        setEditedValues={setEditedValues}
                    />
                )}
            </div>

            <div className="mt-4 flex justify-between">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        setIsSubmitting(true);
                        onSave()
                            .then(() => setIsSubmitting(false))
                            .catch((error) => {
                                console.error('Error saving:', error);
                                setIsSubmitting(false);
                            });
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    {isSubmitting ? 'Saving Rule...' : 'Save Rule'}
                </button>
            </div>
        </div>
    );
};



export default RuleManager;
