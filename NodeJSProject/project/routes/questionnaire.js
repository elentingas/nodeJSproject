let express = require("express");
let router = express.Router();
let questionnaireManager = require("../modules/questionnaire/QuestionnaireManager").QuestionnaireManager.getInstance();

router.get("/", function(req, res, next) {
  res.send("Project");
});

router.post("/submit", function(req, res) {
  let name = req.body.name;
  let work_life_balance_rate = req.body.work_life_balance_rate;
  let salary_rate = req.body.salary_rate;
  let senior_management_rate = req.body.senior_management_rate;
  let self_development_rate = req.body.self_development_rate;
  let organization_development_rate = req.body.organization_development_rate;
  let summary = req.body.summary;

  questionnaireManager.submit(
    name,
    work_life_balance_rate,
    salary_rate,
    senior_management_rate,
    self_development_rate,
    organization_development_rate,
    summary,
    function(code, data) {
      data = typeof data == "object" ? { status: code, data: data } : data;
      data = typeof data == "string" ? data : JSON.stringify(data);

      res.status(code);
      res.end(data);
    }
  );
});

router.put("/editQuestionnaire", function(req, res) {
  let token = req.body.token;
  let updatedQuestionnaire = req.body.updated_questionnaire;

  questionnaireManager.editQuestionnaire(token, updatedQuestionnaire, function(
    code,
    data
  ) {
    data = typeof data == "object" ? { status: code, data: data } : data;
    data = typeof data == "string" ? data : JSON.stringify(data);

    res.status(code);
    res.end(data);
  });
});

router.get("/getQuestionnaire", function(req, res) {
  questionnaireManager.getQuestionnaire(function(code, data) {
    data = typeof data == "object" ? { status: code, data: data } : data;
    data = typeof data == "string" ? data : JSON.stringify(data);

    res.status(code);
    res.end(data);
  });
});

router.get("/getQuestionnaireStats", function(req, res) {
  questionnaireManager.getQuestionnaireStats(function(code, data) {
    data = typeof data == "object" ? { status: code, data: data } : data;
    data = typeof data == "string" ? data : JSON.stringify(data);

    res.status(code);
    res.end(data);
  });
});

module.exports = router;
