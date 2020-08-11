const Datastore = require("nedb"),
  db = new Datastore({ filename: "./user.db", autoload: true });
db.persistence.setAutocompactionInterval(2333);
var doc = {
  uid: 114514,
  lang: "zh_classic"
};

function c(userid, key, value) {
  var doc = {};
  doc["uid"] = userid;
  doc[key] = value;
  db.insert(doc, function(err, newDoc) {
    console.log(err)
    console.log(newDoc);
    db.persistence.compactDatafile();
  });
}

module.exports = { c };
