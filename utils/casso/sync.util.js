/*utils/sync.util.js*/
export default{
        syncTransaction: async (bankNumber, apiKey) => {
        let res = await api.post('/sync', { bank_acc_id: bankNumber });
        return res;
    }
}