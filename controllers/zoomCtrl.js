const axios = require("axios");
const path = require("path");
const jwt = require("jsonwebtoken");

const zoomEmail = "event@nanoscientific.org";

const payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: new Date().getTime() + 5000,
};

const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

const zoomCtrl = {
  // 웨비나 목록 받아오기
  getWebinarList: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.zoom.us/v2/users/${zoomEmail}/webinars`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.status(200).json({
        result: response.data,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },

  // 웨비나 등록 질문 받아오기.
  getRegistrationQuestions: async (req, res) => {
    try {
      const response = await axios.get(
        `https://api.zoom.us/v2/webinars/${req.params.webinarId}/registrants/questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.status(200).json({
        result: response.data,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },
  addRegistrant: async (req, res) => {
    const { questions } = req.body;
    let newQuestions = {};

    Object.entries(questions).forEach(
      (question) => (newQuestions[question[0]] = question[1].value)
    );
    console.log(newQuestions);

    try {
      const response = await axios.post(
        `https://api.zoom.us/v2/webinars/${req.params.webinarId}/registrants`,
        newQuestions,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.status(200).json({
        result: response.data,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },
};

module.exports = zoomCtrl;
