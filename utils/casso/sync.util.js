/*utils/sync.util.js*/
const apiCasso = require('./apiCasso')
module.exports = {
        syncTransaction: async (bankNumber, apiKey) => {
        let res = await apiCasso.post('/sync', { bank_acc_id: bankNumber });
        return res;
    }
}