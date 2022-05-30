const router = require("express").Router();
const commonCtrl = require("../controllers/commonCtrl");
const asiaCtrl = require("../controllers/asiaCtrl");

/**
 * @swagger
 *  /api/page/common/eventLanding:
 *    get:
 *      tags:
 *      - Common
 *      description: 가장 처음 이벤트 랜딩 페이지를 가져옵니다.
 *      parameters:
 *        - name: nation
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/eventLanding").get(commonCtrl.getEventLanding);

/**
 * @swagger
 *  /api/page/common/exhibit/parksystems:
 *    get:
 *      tags:
 *      - Common
 *      description: 파크시스템스 전시회 html 을 가져옵니다.
 *      parameters:
 *        - name: nation
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/exhibit/parksystems").get(commonCtrl.getExhibitParkSystems);

/**
 * @swagger
 *  /api/page/common/exhibit/nanoscientific:
 *    get:
 *      tags:
 *      - Common
 *      description: nanoscientific 전시회 html 을 가져옵니다.
 *      parameters:
 *        - name: nation
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/exhibit/nanoscientific").get(commonCtrl.getNanoScientific);

/**
 * @swagger
 *  /api/page/common/maintenance:
 *    get:
 *      tags:
 *      - Common
 *      description: 사이트 수리중이라는 문구를 받는 HTML 입니다.
 *      parameters:
 *        - name: nation
 *          in: query
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/maintenance").get(commonCtrl.getMaintenance);

/**
 * @swagger
 *  /api/page/common/landing:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 landing page html 을 줍니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/landing").get(commonCtrl.getLanding);

/**
 * @swagger
 *  /api/page/common/sponsors:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 sponsor page html 을 줍니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/sponsors").get(commonCtrl.getSponsors);

/**
 * @swagger
 *  /api/page/common/programs:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 프로그램 정보를 주는 API 입니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/programs").get(commonCtrl.getPrograms);

/**
 * @swagger
 *  /api/page/common/programs/agenda:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 프로그램에 속한 agenda들의 정보를 주는 API 입니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/programs/agenda").get(commonCtrl.getAgenda);

/**
 * @swagger
 *  /api/page/common/sessions:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 세션 정보를 주는 API 입니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */
router.route("/sessions").get(commonCtrl.getSessions);

/**
 * @swagger
 *  /api/page/common/speakers:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 스피커 정보를 주는 API 입니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/speakers").get(commonCtrl.getSpeakers);

/**
 * @swagger
 *  /api/page/common/speakers/keynote:
 *    get:
 *      tags:
 *      - Common
 *      description: 각 국가의 keynote 스피커 정보를 주는 API 입니다. 국가는 쿼리에 담습니다
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/speakers/keynote").get(commonCtrl.getKeynoteSpeakers);

/**
 * @swagger
 *  /api/page/common/speakers/detail:
 *    get:
 *      tags:
 *      - Common
 *      description: id에 해당하는 speaker의 정보를 반환
 *      parameters:
 *        - name: nation
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *        - name: id
 *          in: query
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: successful operation
 */

router.route("/speakers/detail").get(commonCtrl.getSpeakerDetailById);

module.exports = router;
