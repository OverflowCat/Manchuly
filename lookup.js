const replaceall = require("replaceall");
const manchu = require("./ManchuCore");
const OpenCC = require("opencc");
const zhconverter = new OpenCC("t2s.json");
async function simplify(text) {
  var response = await zhconverter.convertPromise(text);
  return response;
}
const pangu = require("pangu");

const chars = "^{()}[]$".split();
const charslen = chars.length;
function realRegex(exp) {
  for (var i = 0; i < charslen; i++) {
    if (exp.indexOf(chars.i) != -1) return true;
    return false; //plain text
  }
}

const _ = require("lodash/object");
const csvFilePath = "dicts.csv";
const csv = require("csvtojson");
const Datastore = require("nedb-promises"),
  db = new Datastore();
//  {filename: 'dict.db', autoload: true}
csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    var trimmed = jsonObj.map(i => {
      //i.zh = i.zh.split(" | ");
      i.zh = i.zh.split(" | ").join("；");
      i.m = i.m.replace(/&nbsp;/g, " ").replace(/( |　)./g, " ");
      i.r = i.r.replace(/&nbsp;/g, " ").replace(/( |　)./g, " ");
      return _.pick(i, ["m", "r", "zh"]);
    });
    //db.insert(trimmed, function(err, newDoc) {});
    db.insert(trimmed);
  });

if (true) {
  csv()
    .fromFile("dicEturc.csv")
    .then(jsonObj => {
      // in this csv:
      // "m,h,o,d,p,c,g" => "manchu, hergen, original, definition, picture, color, group"
      var trimmed = jsonObj.map(item => {
        //console.log(item)
        item.d = item.d.split("||").join(",");
        item.d = item.d.replace(/([a-z@])(，|,)([a-z@])/g, "$1, $3");
        // item.d = item.d.replace(/(\[)((不)?及)(\] ?)/g, '<b>$2</b> ');
        var obj = {};
        obj.m = item["m"];
        obj.r = item["h"];
        obj.zh = item["d"];
        return obj;
      });
      //db.insert(trimmed, function(err, newDoc) {console.log(newDoc.length);});
      db.insert(trimmed).then(newDocs => console.log(newDocs.length));
    });
}

async function any(term, mode) {
  var t = term.replace(/　/g, " ");
  //const isPage = /( (page|PAGE))? ([0-9]+)/.exec(t)
  const segaments = t.split(" ");
  var page = segaments.slice(-1)[0]; //Cannot be a constant!
  page = /^[0-9]+$/.test(page) ? Number(segaments.pop()) : 1; // pop() 删除&返回数组最后一个元素
  t = segaments.join(" ");

  try {
    var statement, newSort;
    if (/[\u4e00-\u9fa5]+/.test(t)) {
      //ニカン語
      // t = await simplify(t);
      console.log(t);
      statement = { zh: new RegExp(t, "gm") };
      newSort = function(array) {
        // Sort with length
        array = array.sort(function(a, b) {
          //return a.zh.join("；").length - b.zh.join("；").length;
          return a.zh.length - b.zh.length;
        });
        // Sort with whole word match
        if (false) {
          array = array.sort(function(a, b) {
            //a = a.zh.includes(simplify(t));
            //b = b.zh.includes(simplify(t));
            //TODO: 批量分割
            a = a.zh.split("；").includes(simplify(t));
            b = b.zh.split("；").includes(simplify(t));
            return b - a;
          });
        }
        return array;
      };
    } else {
      if (manchu.isManchuScript(t)) {
        statement = { m: new RegExp(t, "g") };
        newSort = function(array) {
          // Sort with whole word match
          array = array.sort(function(a, b) {
            a = a.m
              .replace("/", " ")
              .split(" ")
              .includes(t);
            b = b.m
              .replace("/", " ")
              .split(" ")
              .includes(t);
            //simplify is the func for simplifying Chinese
            return b - a;
          });
          return array;
        };
      } else {
        //romanization
        t = t.toLowerCase();
        statement = { r: new RegExp(t, "g") };
        newSort = function(array) {
          // Sort with whole word match
          array = array.sort(function(a, b) {
            a = a.r
              .replace("/", " ")
              .split(" ")
              .includes(t);
            b = b.r
              .replace("/", " ")
              .split(" ")
              .includes(t);
            return b - a;
          });
          return array;
        };
      }
    }
  } catch (err) {
    console.log(err);
    return ["ERR", "Reg Exp Err", err];
  }
  var docs = await db.find(statement);
  //console.log("docs ", docs);

  //Deterimine whether t is a regex or plain text
  if (!realRegex(t)) {
    docs = newSort(docs);
  }

  const l = docs.length;

  const pagelength = 15;
  if (page <= 1) page = 1;
  const pagecount = Math.ceil(l / pagelength);
  if (page * pagelength > l) page = pagecount;
  var o = t.bold() + " with ".italics();
  if (l > pagelength) {
    // Pagination
    docs = docs.slice(
      pagelength * (page - 1),
      page == pagecount ? l : pagelength * page
    );
    o += "page " + page + " of".italics() + " ";
  }
  o += l + " result".italics();
  if (l > 1) {
    o += "s".italics();
  }
  if (l != 0) {
    o += ":\n";
  }
  console.log(o);

  var docso = "";
  docs.map(e => {
    docso +=
      "- " +
      //[e.m.bold(), tag(e.r, "code"), e.zh.join("；")].join(" | ") +
      [e.m.bold(), "<code>" + e.r + "</code>", pangu.spacing(e.zh)].join(
        " | "
      ) +
      "\n";
  });
  if (!realRegex(t)) docso = replaceall(t, "<u>" + t + "</u>", docso);
  //<<<<<<< patch-1
  o = o + docso;
  docso = undefined;
  o = o.replace("undefined", "");
  o = o.replace(/［[0-9]+］/g, "");
  o = o.replace(/(@|v)/g, "ū");
  o = o.replace(/(x|S)/g, "š");
  o = replaceall("| 〔", "|〔", o);
  o = o.replace(/( ?)([\u2460-\u24ff])/, " $2 "); //数字编号的空格
  o = o.replace(/  +/, " ");

  //TODO: pre-transcription
  console.log(o);
  return ["DONE", o, page];
}

module.exports = { any };
