const { getCurrentPool } = require("../utils/getCurrentPool");
const { checkConnectionState } = require("../utils/checkConnectionState");

const menuCtrl = {
  getMenuList: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);

    let connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * FROM menu`;

      connection = await checkConnectionState(connection, currentPool);
      const row = await connection.query(sql);

      if (row[0].length !== 0) {
        res.status(200).json({
          success: true,
          result: row[0],
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
      res.status(500).json({
        success: false,
        msg: err,
      });
    } finally {
      connection.release();
    }
  },
  updateMenuList: async (req, res) => {
    const { nation, menus } = req.body;
    const currentPool = getCurrentPool(nation);

    let connection = await currentPool.getConnection(async (conn) => conn);
    try {
      for (const menu of menus) {
        if (menu.isChanged) {
          const sql = `UPDATE menu SET is_published=${menu.is_published} WHERE id=${menu.id}`;
          connection = await checkConnectionState(connection, currentPool);
          const row = await connection.query(sql);
        }
      }
      res.status(200).json({
        success: true,
        msg: "성공",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        msg: err,
      });
    } finally {
      connection.release();
    }
  },
  getIsAdmin: async (req, res) => {
    const { path, nation } = req.body;
    const currentPool = getCurrentPool(nation);

    let connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT is_published FROM menu WHERE path='${path}'`;

      connection = await checkConnectionState(connection, currentPool);
      const row = await connection.query(sql);

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
      res.status(500).json({
        success: false,
        msg: err,
      });
    } finally {
      connection.release();
    }
  },
  setIsAdmin: async (req, res) => {
    const { path, nation, isPublished } = req.body;
    const currentPool = getCurrentPool(nation);

    let connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE menu SET is_published=${isPublished} WHERE path='${path}'`;

      connection = await checkConnectionState(connection, currentPool);
      await connection.query(sql);

      res.status(200).json({
        success: true,
        msg: "성공",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        msg: err,
      });
    } finally {
      connection.release();
    }
  },
};
module.exports = menuCtrl;
