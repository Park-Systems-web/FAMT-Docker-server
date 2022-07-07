require("dotenv").config();
const axios = require("axios");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const KJUR = require("jsrsasign");

const zoomEmail = "atom@parksystems.com";

const payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: new Date().getTime() + 5000,
};

const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

const zoomCtrl = {
  // 웨비나 목록 받아오기
  getWebinarList: async (req, res) => {
    try {
      let result = [];
      let response = await axios.get(
        `https://api.zoom.us/v2/users/${zoomEmail}/webinars?page_size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      result.push(...response.data.webinars);
      while (response.data.next_page_token !== "") {
        response = await axios.get(
          `https://api.zoom.us/v2/users/${zoomEmail}/webinars?page_size=5&next_page_token=${response.data.next_page_token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        result.push(...response.data.webinars);
      }
      res.status(200).json({
        result,
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

  // 등록시키기
  addRegistrant: async (req, res) => {
    const { questions } = req.body;
    let newQuestions = {};

    Object.entries(questions).forEach(
      (question) => (newQuestions[question[0]] = question[1].value)
    );

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

  // 등록자 리스트 받아오기.
  getRegistrantList: async (req, res) => {
    try {
      let result = [];
      const { webinarId } = req.query;
      let response = await axios.get(
        `https://api.zoom.us/v2/webinars/${webinarId}/registrants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      result.push(
        ...response.data.registrants.map((e) => {
          return {
            email: e.email,
            join_url: e.join_url,
          };
        })
      );
      while (response.data.next_page_token !== "") {
        response = await axios.get(
          `https://api.zoom.us/v2/webinars/${webinarId}/registrants?next_page_token=${response.data.next_page_token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        result.push(
          ...response.data.registrants.map((e) => {
            return {
              email: e.email,
              join_url: e.join_url,
            };
          })
        );
      }
      res.status(200).json({
        result,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },

  getSignature: async (req, res) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;

    const oHeader = { alg: "HS256", typ: "JWT" };

    const oPayload = {
      sdkKey: process.env.ZOOM_SDK_KEY,
      mn: req.body.meetingNumber,
      role: req.body.role,
      iat: iat,
      exp: exp,
      appKey: process.env.ZOOM_SDK_KEY,
      tokenExp: iat + 60 * 60 * 2,
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    const signature = KJUR.jws.JWS.sign(
      "HS256",
      sHeader,
      sPayload,
      process.env.ZOOM_SDK_SECRET
    );

    res.json({
      signature: signature,
    });
  },
};

module.exports = zoomCtrl;
