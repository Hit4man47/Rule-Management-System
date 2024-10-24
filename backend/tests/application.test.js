// test/application.test.js

const axios = require('axios');
const expect = require('chai').expect;

const API_URL = 'http://localhost:5000/api';

describe('Rule Engine Application Tests', () => {
    let rule1Id, rule2Id, combinedRuleId;

    it('should create Rule 1', async () => {
        const rule1String = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
        const response = await axios.post(`${API_URL}/rules`, {
            name: 'Rule 1',
            ruleString: rule1String,
        });
        expect(response.status).to.equal(201);
        rule1Id = response.data.ruleId;
    });

    it('should create Rule 2', async () => {
        const rule2String = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";
        const response = await axios.post(`${API_URL}/rules`, {
            name: 'Rule 2',
            ruleString: rule2String,
        });
        expect(response.status).to.equal(201);
        rule2Id = response.data.ruleId;
    });

    it('should combine Rule 1 and Rule 2', async () => {
        const response = await axios.post(`${API_URL}/rules/combine`, {
            ruleIds: [rule1Id, rule2Id],
            operator: 'AND',
        });
        expect(response.status).to.equal(201);
        combinedRuleId = response.data.ruleId;
    });

    it('should evaluate Rule 1 with userData1 and return true', async () => {
        const userData1 = {
            age: 35,
            department: 'Sales',
            salary: 60000,
            experience: 3,
        };
        const response = await axios.post(`${API_URL}/evaluate`, {
            ruleId: rule1Id,
            userData: userData1,
        });
        expect(response.status).to.equal(200);
        expect(response.data.result).to.be.true;
    });

    it('should evaluate Combined Rule with userData2 and return true', async () => {
        const userData2 = {
            age: 32,
            department: 'Marketing',
            salary: 25000,
            experience: 6,
        };
        const response = await axios.post(`${API_URL}/evaluate`, {
            ruleId: combinedRuleId,
            userData: userData2,
        });
        expect(response.status).to.equal(200);
        expect(response.data.result).to.be.true;
    });

    it('should evaluate Rule 2 with userData3 and return false', async () => {
        const userData3 = {
            age: 28,
            department: 'Sales',
            salary: 15000,
            experience: 2,
        };
        const response = await axios.post(`${API_URL}/evaluate`, {
            ruleId: rule2Id,
            userData: userData3,
        });
        expect(response.status).to.equal(200);
        expect(response.data.result).to.be.false;
    });
});
