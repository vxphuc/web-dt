const mammoth = require("mammoth");
const logger = require("../logger");
const path = require("path");

const convertWorld = {
  convertWorldHTML: async (path) => {
    const result = await mammoth.convertToHtml({ path });
    return result
  },

  convertWorlText: async (path) => {
    const result = await mammoth.extractRawText({ path });
    return result
  },
};

module.exports = convertWorld
