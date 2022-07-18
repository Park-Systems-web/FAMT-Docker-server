const { getCurrentPool } = require("../utils/getCurrentPool");
const nodemailer = require("nodemailer");
const vCode = require("../utils/verificationCode");
const mailHTML = require("../utils/mailTemplates");

const mailCtrl = {
  sendVcode: async (req, res) => {
    const { email, nation } = req.body;
    const currentPool = getCurrentPool(nation);

    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT EXISTS
      (SELECT email FROM user WHERE email="${email}")
      as emailExist`;

      const row = await connection.query(sql);
      connection.release();
      const emailExist = row[0][0].emailExist === 1 ? true : false;

      const [code, token] = vCode.create(email);

      const sql2 = `INSERT INTO email_verification (email, token)
      VALUES ("${email}","${token}")
      ON DUPLICATE KEY UPDATE
      token="${token}"`;

      const row2 = await connection.query(sql2);
      connection.release();

      if (emailExist) {
        const transporter = nodemailer.createTransport({
          debug: true,
          port: 587,
          host: "smtp.office365.com",
          secure: false,
          requireTLS: true,
          tls: {
            ciphers: "SSLv3",
          },
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: "2022 Failure Analysis & Material Testing Symposium <no-reply@parksystems.com>",
          to: email,
          subject: `[${code}] Verification Code`,
          html: mailHTML.forgotPasswordHTML("Reset Your Password", code),
        });

        // info.accepted: [], info.rejected: [].
        // length를 통해 성공 실패 여부 판단 가능.
        if (info.accepted.length === 1) {
          res.status(200).json({
            success: true,
            result: true,
            msg: "메일 전송 성공",
          });
        } else {
          res.status(200).json({
            success: true,
            result: false,
            msg: "메일 전송 실패",
          });
        }
      } else {
        res.status(200).json({
          success: true,
          result: false,
          msg: "이메일에 해당하는 유저 없음",
        });
      }
    } catch (err) {
      console.log(err);
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },

  checkVcode: async (req, res) => {
    const { email, code, nation } = req.body;
    const currentPool = getCurrentPool(nation);

    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT token from email_verification WHERE email="${email}"`;
      const row = await connection.query(sql);
      connection.release();

      const { token } = row[0][0];
      const isCorrect = vCode.check(code, token);
      if (isCorrect) {
        res.status(200).json({
          success: true,
        });
      } else {
        res.status(200).json({
          success: false,
        });
      }
    } catch (err) {
      connection.release();
      console.log(err);
      res.status(500).json({
        success: false,
        msg: err,
      });
    }
  },

  getIsAdmin: async (req, res) => {
    const { path, nation } = req.body;
    const currentPool = getCurrentPool(nation);

    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT is_published FROM menu WHERE path='${path}'`;

      const row = await connection.query(sql);
      connection.release();

      if (row[0].length !== 0) {
        res.status(200).json({
          success: true,
          result: row[0][0].is_published,
          msg: "성공",
        });
      } else {
        res.status(200).json({
          success: true,
          msg: "해당 path가 없음",
        });
      }
    } catch (err) {
      console.log(err);
      connection.release();
      res.status(500).json({
        success: false,
        msg: err,
      });
    } finally {
      connection.release();
    }
  },
};
module.exports = mailCtrl;
