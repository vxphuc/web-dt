const axios = require("axios");
require("dotenv").config();
const bill = require("../models/bill");

const analyzeRevenue = async (req, res) => {
  try {
    const contentUser = req.body.content;
    const Bill = await bill.find({});
    const response = await axios.post(
      `https://openrouter.ai/api/v1/chat/completions`,
      {
        model: "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "user",
            content: `data: ${Bill} \n\n ${contentUser} \n\n`,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
      }
    );
    res.status(200).json({
      message: "Analyze revenue successfully",
      data: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error analyzing revenue:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  analyzeRevenue,
};
