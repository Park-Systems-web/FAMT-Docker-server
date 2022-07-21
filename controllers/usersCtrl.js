const hasher = require("wordpress-hash-node");
const { issueAccessToken, issueRefreshToken } = require("../utils/jwt");
const { getCurrentPool } = require("../utils/getCurrentPool");
const { checkConnectionState } = require("../utils/checkConnectionState");

const usersCtrl = {
  login: async (req, res, next) => {
    const currentPool = getCurrentPool(req.body.nation);

    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;
    const userPw = req.body.password;
    let name = "";
    let participate_method = "";
    let checked = false;

    try {
      const sql = `SELECT email, password, first_name, last_name, role, participate_method FROM user WHERE email='${userEmail}'`;
      connection = await checkConnectionState(connection, currentPool);

      const result = await connection.query(sql);
      if (result[0].length) {
        let dbPassword = result[0][0].password; // 해쉬화 된 db상의 wordpress 비밀번호
        checked = hasher.CheckPassword(userPw, dbPassword);
        role = result[0][0].role;
        name = result[0][0].first_name + " " + result[0][0].last_name;
        participate_method = result[0][0].participate_method;
      }
      connection.release();
    } catch (error) {
      await connection.rollback();
      connection.release();
      res.status(500).json({ error });
      throw error;
    }

    if (checked) {
      // refresh토큰 생성 및 db에 저장
      let refreshToken = issueRefreshToken(userEmail);
      const insertSql = `UPDATE user SET refresh_token='${refreshToken}' WHERE email='${userEmail}'`;
      try {
        connection = await checkConnectionState(connection, currentPool);
        await connection.beginTransaction();
        await connection.query(insertSql);

        await connection.commit();
        connection.release();

        // access토큰 생성
        let accessToken = issueAccessToken(userEmail);

        // 쿠키 세팅
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
        });

        res.status(200).json({
          success: true,
          message: "login success",
          accessToken,
          name,
          role,
          participate_method,
        });
      } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error });
        throw error;
      }
    } else {
      connection.release();
      res.status(200).json({
        success: false,
        message: "user info not match.",
      });
    }
  },

  logout: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);

    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(200).json({
        success: false,
        message: "Refresh token not exists in client",
      });
      return;
    }
    try {
      const sql = `UPDATE user SET refresh_token='' 
      WHERE email='${userEmail}' AND refresh_token='${refreshToken}'`;

      connection = await checkConnectionState(connection, currentPool);
      const result = await connection.query(sql);
      // if (result[0].changedRows === 0) {
      //   res.status(200).json({
      //     success: true,
      //     message: "Already logged out",
      //   });
      // } else {
      res.cookie("refreshToken", "", {
        httpOnly: true,
      });
      res.status(200).json({
        success: true,
        message: "Successfully logged out",
      });
      // }
      connection.release();
    } catch (error) {
      await connection.rollback();
      connection.release();
      res.status(500).json({ error });
      throw error;
    }
  },
  checkEmail: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;

    try {
      const sql = `SELECT EXISTS( 
        SELECT email FROM user WHERE email="${userEmail}"
      ) as result;`;
      connection = await checkConnectionState(connection, currentPool);
      const result = await connection.query(sql);

      connection.release();
      res.status(200).json({
        success: true,
        result: result[0][0].result === 0 ? false : true,
      });
    } catch (err) {
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
    }
  },

  checkPasswordSet: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;

    let result = "";
    try {
      const sql = `SELECT is_password_set FROM user WHERE email="${userEmail}"`;
      connection = await checkConnectionState(connection, currentPool);
      result = await connection.query(sql);

      if (result[0].length === 0) {
        connection.release();
        res.status(200).json({
          success: false,
          result: "email NOT EXIST",
        });
      } else {
        connection.release();
        res.status(200).json({
          success: true,
          result: result[0][0].is_password_set === 0 ? false : true,
          msg: "패스워드 설정: true, 미설정: false",
        });
      }
    } catch (err) {
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
    }
  },

  // 비밀번호 초기 설정
  setPassword: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;
    const userPassword = hasher.HashPassword(req.body.password);

    try {
      const sql2 = `UPDATE user SET password='${userPassword}', is_password_set=1 WHERE email='${userEmail}'`;
      try {
        connection = await checkConnectionState(connection, currentPool);
        await connection.query(sql2);
        connection.release();
        res.status(200).json({
          success: true,
          result: "success",
        });
      } catch (err) {
        connection.release();
        res.status(500).json({
          success: false,
          err,
        });
        return false;
      }
    } catch (err) {
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
    }
  },

  // 비밀번호 재설정
  resetPassword: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = res.locals.email;
    const curPassword = req.body.curPassword;
    const newPassword = hasher.HashPassword(req.body.newPassword);

    try {
      const sql1 = `SELECT password FROM user WHERE email='${userEmail}'`;
      connection = await checkConnectionState(connection, currentPool);
      const passwordRow = await connection.query(sql1);

      if (hasher.CheckPassword(curPassword, passwordRow[0][0].password)) {
        const sql2 = `UPDATE user SET password='${newPassword}', is_password_set=1 WHERE email='${userEmail}'`;
        await connection.query(sql2);
        connection.release();
        res.status(200).json({
          success: true,
          result: "success",
        });
      } else {
        connection.release();
        res.status(200).json({
          success: false,
          code: "P40",
          result: "Current password not matched.",
        });
      }
    } catch (err) {
      console.log(err);
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
      return false;
    }
  },

  // 비밀번호 분실
  forgotPassword: async (req, res) => {
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    const userEmail = req.body.email;
    const newPassword = hasher.HashPassword(req.body.password);

    try {
      const sql = `UPDATE user SET password='${newPassword}', is_password_set=1 WHERE email='${userEmail}'`;
      connection = await checkConnectionState(connection, currentPool);
      await connection.query(sql);
      connection.release();

      res.status(200).json({
        success: true,
        result: true,
        msg: "비밀번호 변경 성공",
      });
    } catch (err) {
      connection.release();
      console.log(err);
      res.status(500).json({
        success: false,
        err,
      });
      return false;
    }
  },

  // 유럽 제외 회원가입
  register: async (req, res) => {
    const {
      participateMethod,
      title,
      firstName,
      lastName,
      email,
      phone,
      institute,
      department,
      country,
      nation,
    } = req.body;

    const currentPool = getCurrentPool(nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `INSERT INTO user(
        participate_method,
        title,
        first_name,
        last_name,
        email,
        password,
        phone,
        institute,
        department,
        country)
      VALUES(
        '${participateMethod}',
        '${title}',
        '${firstName}',
        '${lastName}',
        '${email}',
        '${hasher.HashPassword(null)}',
        '${phone}',
        '${institute}',
        '${department}',
        '${country}'
      )
      `;

      connection = await checkConnectionState(connection, currentPool);
      const result = await connection.query(sql);
      await connection.commit();
      connection.release();

      res.status(200).json({
        success: true,
        id: result[0].insertId,
        message: "Success",
      });
    } catch (err) {
      connection.release();
      res.status(500).json({
        success: false,
        err,
        message: "Failed",
      });
    }
  },
  unregister: async (req, res) => {
    const { nation, id } = req.body;

    const currentPool = getCurrentPool(nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `DELETE FROM user WHERE id=${id}`;
      connection = await checkConnectionState(connection, currentPool);
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      console.log(err);
      connection.release();
      res.status(400).json({
        success: false,
        err,
      });
    }
  },
};

module.exports = usersCtrl;
