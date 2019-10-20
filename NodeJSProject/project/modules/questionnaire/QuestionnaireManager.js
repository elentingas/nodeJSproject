let models = require("../../models/index");
let https = require("https");

let Questionnaire = models.questionnaire;
let Onetimetoken = models.onetimetoken;

let instance = null;

class QuestionnaireManager {
  constructor() {
    this.initialSetup();
  }

  static getInstance() {
    if (!instance) {
      instance = new QuestionnaireManager();
    }
    return instance;
  }

  initialSetup() {}

  validateString(inputString) {
    if (/[^a-zA-Z0-9._-\s]/.test(inputString)) {
      console.log(inputString + " is not valid");
      return false;
    }

    if (inputString.length >= 2) return true;
    else {
      console.log(inputString + " is not valid");
      return false;
    }
  }

  isBetween1and5(inputNumber) {
    return inputNumber >= 1 && inputNumber <= 5;
  }

  validateRating(
    work_life_balance_rate,
    salary_rate,
    senior_management_rate,
    self_development_rate,
    organization_development_rate,
    summary
  ) {
    if (
      (typeof work_life_balance_rate === "number" ||
        typeof work_life_balance_rate === "string") &&
      (typeof salary_rate === "number" || typeof salary_rate === "string") &&
      (typeof senior_management_rate === "number" ||
        typeof senior_management_rate === "string") &&
      (typeof self_development_rate === "number" ||
        typeof self_development_rate === "string") &&
      (typeof organization_development_rate === "number" ||
        typeof organization_development_rate === "string") &&
      (typeof summary === "string" || typeof summary === "undefined")
    ) {
      return !!(
        this.isBetween1and5(work_life_balance_rate) &&
        this.isBetween1and5(salary_rate) &&
        this.isBetween1and5(senior_management_rate) &&
        this.isBetween1and5(self_development_rate) &&
        this.isBetween1and5(organization_development_rate)
      );
    }
    return false;
  }

  submit(
    name,
    work_life_balance_rate,
    salary_rate,
    senior_management_rate,
    self_development_rate,
    organization_development_rate,
    summary,
    completion
  ) {
    if (
      name &&
      work_life_balance_rate &&
      salary_rate &&
      senior_management_rate &&
      self_development_rate &&
      organization_development_rate &&
      this.validateString(name) &&
      this.validateRating(
        work_life_balance_rate,
        salary_rate,
        senior_management_rate,
        self_development_rate,
        organization_development_rate,
        summary
      )
    ) {
      Questionnaire.create({
        name: name,
        work_life_balance_rate: work_life_balance_rate,
        salary_rate: salary_rate,
        senior_management_rate: senior_management_rate,
        self_development_rate: self_development_rate,
        organization_development_rate: organization_development_rate,
        summary: summary
      })
        .then(function(result) {
          const crypto = require("crypto");

          crypto.randomBytes(64, (err, buf) => {
            if (err) {
              completion(500, err);
              throw err;
            }
            let token = buf.toString("hex");

            Onetimetoken.create({
              token: token,
              questionnaire_id: result.id
            })
              .then(function(tokenRecord) {
                completion(200, { token: tokenRecord.token });
              })
              .catch(function(err) {
                completion(500, err);
              });
          });
        })
        .catch(function(err) {
          completion(500, err);
        });
    } else {
      completion(422, { reason: " the user sent invalid data " });
    }
  }

  getQuestionnaire(completion) {
    Questionnaire.findAll({ raw: true })
      .then(function(result) {
        completion(200, result);
      })
      .catch(function(err) {
        completion(500, err);
      });
  }

  getQuestionnaireStats(completion) {
    Questionnaire.findAll({ raw: true })
      .then(function(result) {
        let average = {
          work_life_balance_rate: 0,
          salary_rate: 0,
          senior_management_rate: 0,
          self_development_rate: 0,
          organization_development_rate: 0
        };
        let resultLength = result.length;
        result.forEach(record => {
          average.work_life_balance_rate += record.work_life_balance_rate;
          average.salary_rate += record.salary_rate;
          average.senior_management_rate += record.senior_management_rate;
          average.self_development_rate += record.self_development_rate;
          average.organization_development_rate +=
            record.organization_development_rate;
        });
        average.work_life_balance_rate = Math.round(
          average.work_life_balance_rate / resultLength
        );
        average.salary_rate = Math.round(average.salary_rate / resultLength);
        average.senior_management_rate = Math.round(
          average.senior_management_rate / resultLength
        );
        average.self_development_rate = Math.round(
          average.self_development_rate / resultLength
        );
        average.organization_development_rate = Math.round(
          average.organization_development_rate / resultLength
        );

        completion(200, average);
      })
      .catch(function(err) {
        completion(500, err);
      });
  }

  editQuestionnaire(token, updatedQuestionnaire, completion) {
    let oldToken = token;
    let {
      name,
      work_life_balance_rate,
      salary_rate,
      self_development_rate,
      organization_development_rate,
      senior_management_rate,
      summary
    } = updatedQuestionnaire;

    if (
      updatedQuestionnaire &&
      name &&
      work_life_balance_rate &&
      salary_rate &&
      senior_management_rate &&
      self_development_rate &&
      organization_development_rate &&
      this.validateString(name) &&
      this.validateRating(
        work_life_balance_rate,
        salary_rate,
        senior_management_rate,
        self_development_rate,
        organization_development_rate,
        summary
      )
    ) {
      Onetimetoken.findOne({ where: { token: token } })
        .then(function(record) {
          if (record) {
            let createdAt = new Date(record.createdAt);
            let currentDate = new Date();
            let weekAgo = currentDate.getDate() - 7;
            currentDate.setDate(weekAgo);
            console.log(createdAt, currentDate, createdAt > currentDate);
            if (createdAt > currentDate) {
              let questionnaire_id = record.questionnaire_id;
              Questionnaire.findOne({ where: { id: questionnaire_id } })
                .then(function(questionnaireRecord) {
                  if (questionnaireRecord) {
                    Questionnaire.update(
                      { ...updatedQuestionnaire },
                      { where: { id: questionnaire_id } }
                    )
                      .then(function(result) {
                        const crypto = require("crypto");

                        crypto.randomBytes(64, (err, buf) => {
                          if (err) {
                            completion(500, err);
                            throw err;
                          }
                          let token = buf.toString("hex");

                          Onetimetoken.create({
                            token: token,
                            questionnaire_id: questionnaire_id
                          })
                            .then(function(tokenRecord) {
                              Onetimetoken.destroy({
                                where: { token: oldToken }
                              });
                              completion(200, { token: tokenRecord.token });
                            })
                            .catch(function(err) {
                              completion(500, err);
                            });
                        });
                      })
                      .catch(function(err) {
                        completion(500, err);
                      });
                  } else completion(404, { reason: " not found " });
                })
                .catch(function(err) {
                  completion(500, err);
                });
            } else completion(403, { reason: " token has expired " });
          } else completion(404, { reason: " not found " });
        })
        .catch(function(err) {
          completion(500, err);
        });
    } else completion(422, { reason: " invalid updated questionnaire " });
  }
}

exports.QuestionnaireManager = QuestionnaireManager;
