const { getCurrentPool } = require("../utils/getCurrentPool");
const {
  verifyToken,
  issueAccessToken,
  issueRefreshToken,
  compareRefreshToken,
} = require("../utils/jwt");
const { checkConnectionState } = require("../utils/checkConnectionState");

module.exports = {
  checkToken: async (req, res, next) => {
    if (getCurrentPool(req.body.nation) === "") {
      res.status(200).json({
        success: false,
        message: "no pool selected. (root)",
      });
      return;
    }
    const accessToken = verifyToken(req.body.accessToken);
    const refreshToken = verifyToken(req.cookies.refreshToken);

    if (accessToken === null) {
      if (refreshToken === null) {
        // case 1: 둘다 만료 -> 로그아웃
        res
          .status(200)
          .json({ success: false, code: "T40", message: "token is expired" });
      } else {
        // case 2: access 만료, refresh 살아있음 -> access 재발급
        let newAccessToken = issueAccessToken(refreshToken.email);
        // 다음 미들웨어에서 접근하기 위한 전역 변수로 지정
        res.locals.accessToken = newAccessToken;

        next();
      }
    } else {
      if (refreshToken === null) {
        // case 3: access 살아있음, refresh 만료 -> refresh 재발급
        let newRefreshToken = issueRefreshToken(accessToken.email);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
        });
        res.locals.accessToken = req.body.accessToken;
        next();
      } else {
        // case 4: 둘다 존재한다면, refresh token을 db와 비교.
        res.locals.accessToken = req.body.accessToken;
        next();
      }
    }
  },

  readUser: async (req, res, next) => {
    const accessToken = verifyToken(res.locals.accessToken);
    const currentPool = getCurrentPool(req.body.nation);
    let connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `SELECT 
      email,
      role,
      first_name,
      last_name,
      is_password_set,
      participate_method
      FROM user 
      WHERE email="${accessToken.email}"
      AND refresh_token="${req.cookies.refreshToken}"`;

      connection = await checkConnectionState(connection, currentPool);
      const result = await connection.query(sql);

      if (result[0].length === 0) {
        // refresh token에 해당하는 유저가 없을 때
        res.status(200).json({
          success: false,
          code: "T41",
          message: "Logged in from another browser.",
        });
        return;
      } else {
        res.locals.email = accessToken.email;
        res.locals.name = `${result[0][0].first_name} ${result[0][0].last_name}`;
        res.locals.role = result[0][0].role;
        res.locals.isPasswordSet = result[0][0].is_password_set === 1;
        res.locals.participate_method = result[0][0].participate_method;
      }
      connection.release();
      next();
    } catch (err) {
      connection.release();
      console.log(err);
      res.status(500).json({
        success: false,
        code: "S0",
        err,
      });
    }
  },
};
