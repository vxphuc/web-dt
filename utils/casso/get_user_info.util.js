/*utils/get_user_info.util.js*/
const api = require("./apiCasso");
module.exports = {
        getDetailUser: async () => {
        let res = await api.get(`/userInfo`);
        return res;
    }
}