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
    // B1: Lấy danh sách webhook
    const list = await api.get("/webhooks");

    if (!list?.data) return;

    // B2: Tìm webhook có URL trùng khớp
    const found = list.data.find((w) => w.webhook === urlWebhook);

    if (!found) return;

    // B3: Xóa đúng theo ID
    return await api.delete(`/webhooks/${found.id}`);
  },
  /*webhook.util.js*/
  parseOrderId: (description) => {
    if (!description) return null;

    const regex = /([a-fA-F0-9]{24})/;
    const match = description.match(regex);

    if (!match) return null;

    return {
      description: match[1],
    };
  },
};
