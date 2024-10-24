import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getRules = async () => {
    const response = await axios.get(`${API_BASE_URL}/rules`);
    return response.data;
};

export const getRuleAST = async (ruleId) => {
    const response = await axios.get(`${API_BASE_URL}/rules/${ruleId}/ast`);
    return response.data;
}

export const createRule = async (ruleName, ruleString) => {
    const response = await axios.post(`${API_BASE_URL}/rules`, { ruleName, ruleString });
    return response;
};

export const evaluateRule = async (ruleId, data) => {
    const response = await axios.post(`${API_BASE_URL}/evaluate`, {
        ruleId,
        ...data
    });
    return response.data;
};

export const getAttributes = async () => {
    const response = await axios.get(`${API_BASE_URL}/rules/attributes`);
    return response.data;
};

export const updateRule = async (id, updatedValues) => {
    return axios.put(`${API_BASE_URL}/rules/${id}`, { updatedValues });
};


