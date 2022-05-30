const path = require("path");
const { getCurrentPool } = require("../utils/getCurrentPool");

const adminCtrl = {
  addSession: async (req, res) => {
    const { nation, title, date } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `INSERT INTO program_sessions(session_title,date) VALUES('${title}','${date.substr(
        0,
        10
      )}')`;

      const result = await connection.query(sql);
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  modifySession: async (req, res) => {
    const { nation, title, date, id, status } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `UPDATE program_sessions SET session_title='${title}',date='${date.substr(
        0,
        10
      )}', status=${status} WHERE id=${id}`;

      const result = await connection.query(sql);
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  deleteSession: async (req, res) => {
    const nation = req.query.nation;
    const id = req.params.id;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      // delete agendas
      let sql = `DELETE FROM program_agenda WHERE session_id=${id}`;
      const agendaResult = await connection.query(sql);

      // delete programs
      sql = `DELETE FROM programs WHERE session=${id}`;
      const programResult = await connection.query(sql);

      // delete session
      sql = `DELETE FROM program_sessions WHERE id=${id}`;
      await connection.query(sql);

      res.status(200).json({
        success: true,
        message: `1개의 세션 삭제, ${programResult[0].affectedRows}개의 프로그램 삭제, ${agendaResult[0].affectedRows}개의 아젠다 삭제`,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: err,
      });
    } finally {
      connection.release();
    }
  },

  addProgram: async (req, res) => {
    const {
      nation,
      session,
      title,
      speakers,
      description,
      startTime,
      endTime,
      emphasize,
    } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `INSERT INTO programs(session,start_time,end_time,title,speakers,description, emphasize) VALUES(${session},'${startTime}','${endTime}','${title}','${speakers}','${description}', ${emphasize})`;

      const sqlResult = await connection.query(sql);
      // console.log(sqlResult[0]);

      try {
        const adjustSql = `UPDATE programs SET next_id=${sqlResult[0].insertId} WHERE id!=${sqlResult[0].insertId} AND session=${session} AND next_id IS NULL`;
        const adjustSqlResult = await connection.query(adjustSql);
        // console.log(adjustSqlResult);
        res.status(200).json({
          success: true,
          message: "Success",
        });
      } catch (err) {
        res.status(200).json({
          success: false,
          message: "Failed",
          err,
        });
        console.log(err);
      }
      connection.release();
    } catch (err) {
      res.status(200).json({
        success: false,
        message: "Failed",
        err,
      });
      console.log(err);
    }
  },
  modifyProgram: async (req, res) => {
    const {
      nation,
      title,
      id,
      session,
      speakers,
      description,
      startTime,
      endTime,
      emphasize,
    } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE programs SET 
      session=${session}, 
      title='${title}',
      speakers='${speakers}',
      description="${description}",
      start_time='${startTime}',
      end_time='${endTime}',
      emphasize=${emphasize} WHERE id=${id}`;

      await connection.query(sql);
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  deleteProgram: async (req, res) => {
    const nation = req.query.nation;
    const id = req.params.id;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      let sql = `SELECT * FROM programs WHERE id=${id}`;

      const selectResult = await connection.query(sql);
      const nextId = selectResult[0][0].next_id;

      sql = `DELETE FROM programs WHERE id=${id}`;
      await connection.query(sql);
      // 딸려있는 agenda 삭제
      sql = `DELETE FROM program_agenda WHERE program_id=${id}`;
      await connection.query(sql);

      sql = `UPDATE programs SET next_id=${nextId} WHERE next_id=${id}`;
      await connection.query(sql);

      res.status(200).json({
        success: true,
        message: `id:${id} 프로그램 삭제`,
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        message: err,
      });
    } finally {
      connection.release();
    }
  },

  // agenda
  addAgenda: async (req, res) => {
    const { nation, program_id, title, speakers, session_id } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `INSERT INTO program_agenda(session_id,program_id,title,speakers) 
      VALUES(${session_id},${program_id},'${title}','${speakers}')`;

      const sqlResult = await connection.query(sql);

      try {
        const adjustSql = `UPDATE program_agenda SET 
        next_id=${sqlResult[0].insertId} 
        WHERE 
        id!=${sqlResult[0].insertId} 
        AND program_id=${program_id} 
        AND next_id=99999`;
        const adjustSqlResult = await connection.query(adjustSql);
        res.status(200).json({
          success: true,
          message: "Success",
        });
      } catch (err) {
        res.status(200).json({
          success: false,
          message: "Failed",
          err,
        });
        console.log(err);
      }
      connection.release();
    } catch (err) {
      res.status(200).json({
        success: false,
        message: "Failed",
        err,
      });
      console.log(err);
    }
  },
  modifyAgenda: async (req, res) => {
    const { nation, title, id, program_id, speakers, session_id } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE program_agenda SET session_id=${session_id},program_id=${program_id}, title='${title}',speakers='${speakers}' WHERE id=${id}`;

      await connection.query(sql);
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      res.status(200).json({
        success: false,
        message: "Failed",
        err,
      });
      console.log(err);
    }
  },

  deleteAgenda: async (req, res) => {
    const nation = req.query.nation;
    const id = req.params.id;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      let sql = `SELECT * FROM program_agenda WHERE id=${id}`;

      const selectResult = await connection.query(sql);
      const nextId = selectResult[0][0].next_id;

      sql = `DELETE FROM program_agenda WHERE id=${id}`;
      await connection.query(sql);

      sql = `UPDATE program_agenda SET next_id=${nextId} WHERE next_id=${id}`;
      await connection.query(sql);

      res.status(200).json({
        success: true,
        message: `id:${id} 프로그램 삭제`,
      });
    } catch (err) {
      res.status(200).json({
        success: false,
        message: err,
      });
    } finally {
      connection.release();
    }
  },

  reorderAgenda: async (req, res) => {
    const { agendaList, nation } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      for (const agenda of agendaList) {
        const sql = `UPDATE program_agenda SET next_id=${agenda.next_id} WHERE id=${agenda.id}`;
        await connection.query(sql);
      }
      res.status(200).json({
        success: true,
        agendaList,
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

  getHideProgram: async (req, res) => {
    const { nation } = req.query;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `SELECT * FROM programs WHERE status=0`;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  getHideSession: async (req, res) => {
    const { nation } = req.query;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `SELECT * FROM program_sessions WHERE status=0`;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  showProgram: async (req, res) => {
    const { nation, programs } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      programs.map(async (program) => {
        const sql = `UPDATE programs SET status=1 WHERE id=${program.id}`;
        await connection.query(sql);
      });
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  showSession: async (req, res) => {
    const { nation, sessions } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      sessions.map(async (session) => {
        const sql = `UPDATE program_sessions SET status=1 WHERE id=${session.id}`;
        await connection.query(sql);
      });
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  addSpeaker: async (req, res) => {
    const {
      nation,
      name,
      belong,
      imagePath,
      keynote,
      description,
      abstractBelong,
      abstractDesc,
      hasAbstract,
    } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `INSERT INTO speakers
      (name,belong,image_path,status,keynote,description,has_abstract)
      VALUES('${name}','${belong}','${imagePath}',1, ${keynote},'${description}', ${hasAbstract})`;
      const data = await connection.query(sql);

      const sql2 = `INSERT INTO speaker_abstract(speaker_id,belong,description)
          VALUES(${data[0].insertId},'${abstractBelong}','${abstractDesc}')`;
      await connection.query(sql2);

      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },
  modifySpeaker: async (req, res) => {
    const {
      nation,
      name,
      belong,
      imagePath,
      id,
      keynote,
      description,
      abstractBelong,
      abstractDesc,
      hasAbstract,
    } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE speakers SET 
      name='${name}',
      belong='${belong}',
      image_path='${imagePath}',
      keynote=${keynote},
      description='${description}', 
      has_abstract=${hasAbstract}
      WHERE id=${id}
      `;

      const data = await connection.query(sql);

      const sql2 = `INSERT INTO speaker_abstract (
        speaker_id,
        belong,
        description
        ) VALUES (
          ${id},
          '${abstractBelong}',
          '${abstractDesc}'
        )
        ON DUPLICATE KEY UPDATE
          belong='${abstractBelong}',
          description='${abstractDesc}'
        `;

      await connection.query(sql2);

      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  deleteSpeaker: async (req, res) => {
    const nation = req.query.nation;
    const id = req.params.id;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `DELETE FROM speakers WHERE id=${id}`;
      await connection.query(sql);
      const sql2 = `DELETE FROM speaker_abstract WHERE speaker_id=${id}`;
      await connection.query(sql2);

      res.status(200).json({
        success: true,
        message: `연사 삭제 완료`,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err,
      });
    } finally {
      connection.release();
    }
  },

  showSpeaker: async (req, res) => {
    const { nation, speakers } = req.body;
    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      speakers.map(async (speaker) => {
        const sql = `UPDATE speakers SET status=1 WHERE id=${speaker.id}`;
        await connection.query(sql);
      });
      res.status(200).json({
        success: true,
        message: "Success",
      });
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  getHideSpeaker: async (req, res) => {
    const { nation } = req.query;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);

    try {
      const sql = `SELECT * FROM speakers WHERE status=0`;
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  getUsers: async (req, res) => {
    const { nation } = req.query;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      let sql = "";
      if (nation === "eu") {
        // eu 일땐 점수메기는항목 5개 존재
        sql = `SELECT id,email,title,role,last_name,first_name,institute,department,createdAt FROM user`;
      } else {
        sql = `SELECT * FROM user`;
      }
      const result = await connection.query(sql);
      res.send(result[0]);
      connection.release();
    } catch (err) {
      console.log(err);
    }
  },

  updateRole: async (req, res) => {
    const { nation, id, role } = req.body;

    const currentPool = getCurrentPool(nation);
    const connection = await currentPool.getConnection(async (conn) => conn);
    try {
      const sql = `UPDATE user SET role='${role}' WHERE id=${id}`;
      await connection.query(sql);
      res.status(200).json({
        success: true,
        msg: "변경 성공",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        err,
      });
    } finally {
      connection.release();
    }
  },
};

module.exports = adminCtrl;
