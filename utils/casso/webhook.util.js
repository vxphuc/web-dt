/*webhook.util.js*/
const api = require("./apiCasso");
module.exports = {
  create: async (data) => {
    let res = await api.post("/webhooks", data);
    return res;
  },
  getDetailWebhookById: async (webhookId) => {
    let res = await api.get(`/webhooks/${webhookId}`);
    return res;
  },
  updateWebhookById: async (webhookId, data) => {
    let res = await api.put(`/webhooks/${webhookId}`, data);
    return res;
  },
  deleteWebhookById: async (webhookId) => {
    let res = await api.delete(`/webhooks/${webhookId}`);
    return res;
  },
  deleteWebhookByUrl: async (urlWebhook) => {
    // Thêm url vào query để delete https://oauth.casso.vn/v1/webhooks?webhook=https://website-cua-ban.com/api/webhook
    let query = { params: { webhook: urlWebhook } };
    let res = await api.delete(`/webhooks`, query);
    return res;
  },
  /*webhook.util.js*/
  parseOrderId: (description) => {
  if (!description) return null;

  const regex = /([a-fA-F0-9]{24})/;
  const match = description.match(regex);

  if (!match) return null;

  return {
    description: match[1]
  };
}

};
