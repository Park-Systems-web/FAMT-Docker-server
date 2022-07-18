const { default: axios } = require("axios");
const path = require("path");
const { getCurrentPool } = require("../utils/getCurrentPool");

const commonCtrl = {
  getExhibitParkSystems: async (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public/common/exhibitParkSystems.html")
    );
  },

  getNanoScientific: async (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public/common/exhibitNanoScientific.html")
    );
  },
  getPrograms: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * FROM programs WHERE status=1 ORDER BY start_time `;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  getAgenda: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * FROM program_agenda ORDER BY program_id,next_id`;
      const result = await connection.query(sql);
      res.status(200).json({ success: 1, data: result[0] });
      connection.release();
    } catch (err) {
      res.status(200).json({ success: 0, err });
      console.log(err);
      connection.release();
    }
  },
  getSessions: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * FROM program_sessions WHERE status=1 ORDER BY date `;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  getSpeakers: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `
      SELECT 
      *
      FROM speakers as S
      `;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  getKeynoteSpeakers: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * FROM speakers WHERE keynote=1`;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  getSpeakerDetailById: async (req, res) => {
    const { nation, id } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `
      SELECT 
        S.id, 
        S.name, 
        S.image_path,
        S.description as title,
        SA.belong,
        SA.description
      FROM speakers as S 
      INNER JOIN speaker_abstract as SA 
        ON S.id=SA.speaker_id WHERE S.id=${id}
      `;
      const result = await connection.query(sql);
      connection.release();
      if (result[0].length === 0) {
        res.status(200).json({
          success: true,
          result: { ...result[0][0] },
        });
      } else {
        res.status(200).json({
          success: true,
          result: {
            ...result[0][0],
          },
        });
      }
    } catch (err) {
      console.log(err);
      connection.release();

      res.status(200).json({ success: false, err });
    }
  },

  getLanding: async (req, res) => {
    const { nation } = req.query;
    res.sendFile(path.join(__dirname, "..", `public/${nation}/landing.html`));
  },

  getBanner: async (req, res) => {
    const { nation, path } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT banner_path from banner WHERE path='${decodeURIComponent(
        path
      )}'`;
      const row = await connection.query(sql);
      connection.release();
      if (row[0].length === 0) {
        res.status(200).json({
          success: false,
          msg: "no banner",
        });
      } else {
        res.status(200).json({
          success: true,
          result: row[0][0].banner_path,
        });
      }
    } catch (err) {
      connection.release();
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  setBanner: async (req, res) => {
    const { nation, path, imagePath } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE banner SET banner_path='${imagePath}' WHERE path='${decodeURIComponent(
        path
      )}'`;
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  getLandingContent: async (req, res) => {
    const { nation } = req.query;
    const { id } = req.params;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * from landing_section_${id}`;
      const row = await connection.query(sql);
      connection.release();
      if (row[0].length === 0) {
        res.status(200).json({
          success: false,
          msg: "no content",
        });
      } else {
        res.status(200).json({
          success: true,
          result: row[0],
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },

  setLanding2Content: async (req, res) => {
    const { nation, title, description } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE landing_section_2 SET 
      title='${title}',
      description='${description}'
      WHERE id=1`;
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  setLanding4Content: async (req, res) => {
    const { nation, title, description } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `INSERT INTO landing_section_4 (title,description) VALUES 
      ('${title}','${description}')`;
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  modifyLanding4Content: async (req, res) => {
    const { nation, id, title, description } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE landing_section_4 SET 
      title='${title}',
      description='${description}'
      WHERE id=${id}`;
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  deleteLanding4Content: async (req, res) => {
    const { nation, id } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `DELETE FROM landing_section_4 WHERE id=${id}`;
      await connection.query(sql);
      connection.release();
      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },

  getSponsor: async (req, res) => {
    const { nation } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `SELECT * from sponsor`;
      const row = await connection.query(sql);
      connection.release();

      let response = {};
      response.success = true;
      response.result = row[0];

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },

  addSponsor: async (req, res) => {
    const { nation, name, url, imagePath, height } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `INSERT INTO sponsor 
      (name, url, image_path, height)
      VALUES
      ('${name}','${url}','${imagePath}', ${height ? height : 0})
      `;
      const row = await connection.query(sql);
      connection.release();

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  modifySponsor: async (req, res) => {
    const { nation, id, name, url, imagePath, height } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE sponsor SET
      name='${name}', url='${url}',
      image_path='${imagePath}',
      height=${height ? height : 0}
      WHERE id=${id}
      `;
      const row = await connection.query(sql);
      connection.release();

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
  deleteSponsor: async (req, res) => {
    const { nation, id } = req.query;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `DELETE FROM sponsor WHERE id=${id}`;
      const row = await connection.query(sql);
      connection.release();

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
};

module.exports = commonCtrl;
