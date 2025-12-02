/*utils/sync.util.js*/
module.exports = {
        syncTransaction: async (bankNumber, apiKey) => {
        let res = await api.post('/sync', { bank_acc_id: bankNumber });
        return res;
    }
}