const { japanConnection } = require("../dbConfig");
const path = require("path");

const japanCtrl = {


  getExhibitParkSystems: async (req, res) => {
    res.sendFile(
      path.join(__dirname, "..", "public/jp/japanExhibitParkSystems.html")
    );
  },

};

module.exports = japanCtrl;
