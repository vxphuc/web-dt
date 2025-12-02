/*utils/get_user_info.util.js*/
export default{
        getDetailUser: async () => {
        let res = await api.get(`/userInfo`);
        return res;
    }
}