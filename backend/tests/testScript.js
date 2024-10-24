// testScript.js

const axios = require('axios');

// Set the base URL for the API
const API_URL = 'http://localhost:5000/api';

async function testApplication() {
    try {
        // Step 1: Create Rule 1
        const rule1String = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
        const createRule1Response = await axios.post(`${API_URL}/rules`, {
            name: 'Rule 1',
            ruleString: rule1String,
        });
        const rule1Id = createRule1Response.data.ruleId;
        console.log(`Rule 1 created with ID: ${rule1Id}`);

        // Step 2: Create Rule 2
        const rule2String = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";
        const createRule2Response = await axios.post(`${API_URL}/rules`, {
            name: 'Rule 2',
            ruleString: rule2String,
        });
        const rule2Id = createRule2Response.data.ruleId;
        console.log(`Rule 2 created with ID: ${rule2Id}`);

        // Step 3: Combine Rule 1 and Rule 2
        const combineResponse = await axios.post(`${API_URL}/rules/combine`, {
            ruleIds: [rule1Id, rule2Id],
            operator: 'AND', // Change to 'OR' if desired
        });
        const combinedRuleId = combineResponse.data.ruleId;
        console.log(`Combined Rule created with ID: ${combinedRuleId}`);

        // Step 4: Evaluate Rule 1 with sample data
        const userData1 = {
            age: 35,
            department: 'Sales',
            salary: 60000,
            experience: 3,
        };

        const evaluateRule1Response = await axios.post(`${API_URL}/evaluate`, {
            ruleId: rule1Id,
            userData: userData1,
        });

        console.log(`Evaluation of Rule 1 with userData1: ${evaluateRule1Response.data.result}`);

        // Step 5: Evaluate Combined Rule with sample data
        const userData2 = {
            age: 32,
            department: 'Marketing',
            salary: 25000,
            experience: 6,
        };

        const evaluateCombinedRuleResponse = await axios.post(`${API_URL}/evaluate`, {
            ruleId: combinedRuleId,
            userData: userData2,
        });

        console.log(`Evaluation of Combined Rule with userData2: ${evaluateCombinedRuleResponse.data.result}`);

        // Step 6: Evaluate Rule 2 with sample data that should fail
        const userData3 = {
            age: 28,
            department: 'Sales',
            salary: 15000,
            experience: 2,
        };

        const evaluateRule2Response = await axios.post(`${API_URL}/evaluate`, {
            ruleId: rule2Id,
            userData: userData3,
        });

        console.log(`Evaluation of Rule 2 with userData3: ${evaluateRule2Response.data.result}`);
    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testApplication();
