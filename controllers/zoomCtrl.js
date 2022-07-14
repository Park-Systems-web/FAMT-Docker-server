require("dotenv").config();
const axios = require("axios");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const KJUR = require("jsrsasign");
const { getCurrentPool } = require("../utils/getCurrentPool");

const zoomEmail = "atom@parksystems.com";

const payload = {
  iss: process.env.ZOOM_API_KEY,
  exp: new Date().getTime() + 5000,
};

const token = jwt.sign(payload, process.env.ZOOM_API_SECRET);

const zoomCtrl = {
  // 웨비나 목록 받아오기
  // getWebinarList: async (req, res) => {
  //   try {
  //     let result = [];
  //     let response = await axios.get(
  //       `https://api.zoom.us/v2/users/${zoomEmail}/webinars?page_size=5`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     result.push(...response.data.webinars);
  //     while (response.data.next_page_token !== "") {
  //       response = await axios.get(
  //         `https://api.zoom.us/v2/users/${zoomEmail}/webinars?page_size=5&next_page_token=${response.data.next_page_token}`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       result.push(...response.data.webinars);
  //     }
  //     res.status(200).json({
  //       result,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).json({
  //       err,
  //     });
  //   }
  // },
  getWebinarList: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT webinar_id FROM webinar`;
      const row = await connection.query(sql);

      const webinarIdList = row[0].map((e) => e.webinar_id);

      let result = [];
      for (let wi of webinarIdList) {
        let response = await axios.get(
          `https://api.zoom.us/v2/webinars/${wi}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const {
          uuid,
          id,
          host_id,
          created_at,
          duration,
          join_url,
          start_time,
          timezone,
          topic,
          type,
        } = response.data;
        result.push({
          uuid,
          id,
          host_id,
          created_at,
          duration,
          join_url,
          start_time,
          timezone,
          topic,
          type,
        });
      }
      res.status(200).json({
        result,
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },

  getWebinar: async (req, res) => {
    const { nation } = req.query;
    const { webinarId } = req.params;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      let response = await axios.get(
        `https://api.zoom.us/v2/webinars/${webinarId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const {
        uuid,
        id,
        host_id,
        created_at,
        duration,
        join_url,
        start_time,
        timezone,
        topic,
        type,
      } = response.data;

      if (response.data.code === 3001) {
        res.status(200).json({
          result: null,
          success: true,
        });
      } else {
        res.status(200).json({
          result: {
            uuid,
            id,
            host_id,
            created_at,
            duration,
            join_url,
            start_time,
            timezone,
            topic,
            type,
          },
          success: true,
        });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
        success: false,
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

  getRegistrantLink: async (req, res) => {
    try {
      const { webinarId } = req.params;
      const { email } = req.query;
      let response = await axios.get(
        `https://api.zoom.us/v2/webinars/${webinarId}/registrants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let filtered = response.data.registrants.filter((e) => e.email === email);
      if (filtered.length > 0) {
        result = filtered[0].join_url;
        res.status(200).json({
          result,
        });
        return;
      }
      while (response.data.next_page_token !== "") {
        response = await axios.get(
          `https://api.zoom.us/v2/webinars/${webinarId}/registrants?next_page_token=${response.data.next_page_token}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        let filtered = response.data.registrants.filter(
          (e) => e.email === email
        );
        if (filtered.length > 0) {
          result = filtered[0].join_url;
          res.status(200).json({
            result,
          });
          return;
        }
      }
      res.status(200).json({
        result: null,
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
  addWebinar: async (req, res) => {
    const { nation } = req.query;
    const { webinarId } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `INSERT INTO webinar (webinar_id) VALUES ("${webinarId}")`;
      await connection.query(sql);
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        err,
      });
    }
  },
  removeWebinar: async (req, res) => {
    const { nation, webinarId } = req.params;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `DELETE FROM webinar WHERE webinar_id="${webinarId}"`;
      await connection.query(sql);
      res.status(200).json({
        success: true,
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
