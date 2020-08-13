const express = require("express");
const app = express();
const http = require("http");
const manchu = require("./ManchuCore");
const fs = require("fs");
const OpenCC = require("opencc");
const zhconverter = new OpenCC("t2s.json");
const userdb = require("./user");
const replaceall = require("replaceall");
const pangu = require("pangu");
//const lookup = require('./lookup')

//userdb.c(114514, "lang", "zh_classic");
//userdb.c(114515, "lang", "zh_classic");
//const diskord = require('./diskord')
//var simplify = require("hanzi-tools").simplify;
async function simplify(text) {
  var response = await zhconverter.convertPromise(text);
  return response;
}

function tsimplify(t) {
  return t;
}

const crc32 = require("./rdm.js").crc32;
function tag(text, tag) {
  return "<" + tag + ">" + text + "</" + tag + ">";
}

// Express /////////////////////////////////
app.use(express.static("public"));
app.get("/", function(request, response) {
  app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
  });
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + process.env.PORT);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
////////////////////////////////////////////

const _ = require("lodash/object");
const csvFilePath = "dicts.csv";
const csv = require("csvtojson");
const Datastore = require("nedb"),
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
    db.insert(trimmed, function(err, newDoc) {});
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
      db.insert(trimmed, function(err, newDoc) {
        console.log(newDoc.length);
      });
    });
}

const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((ctx, next) => {
  const start = new Date();
  return next(ctx).then(() => {
    const ms = new Date() - start;
    console.log("Response time %sms", ms);
  });
});

const chars = "^{()}[]$".split();
const charslen = chars.length;
function realRegex(exp) {
  for (var i = 0; i < charslen; i++) {
    if (exp.indexOf(chars.i) != -1) return true;
    return false; //plain text
  }
}

function cmd(t, c) {
  if (c.substring(0, 1) != "/") c = "/" + c;
  const l = c.length;
  if (t.substring(0, l + 1) == c + " " || t == c) return t.substring(l + 1);
  return false;
}

bot.command("start", ctx => {
  ctx.replyWithPhoto({
    url:
      "https://cdn.glitch.com/e41d8351-01f6-4af8-b0ee-bd4710cb3769%2FA7BA13F8-3D6B-475B-9D23-98649A31754E.jpeg?v=1569678896904"
  });
  return ctx.replyWithHTML(
    "欢迎使用 @OverflowCat 的满洲里 bot。" +
      "阁下可以使用满语、转写或中文查询满语词汇。\n" +
      'Github repo: <a href="https://github.com/OverflowCat/Manchuly">OverflowCat/Manchuly</a>'
  );
});

bot.command("ping", ctx => ctx.reply("Pong!"));

bot.on("text", async ctx => {
  if (t.indexOf("/") == 0) {
    var word = cmd(t, "/word");
    if (word === "")
      return ctx.reply("用法：\n /word <gibsun|ᡤᡳᠪᠰᡠᠨ|詞或整句> 查詢整個單詞");
    if (word) {
      t = "(^|\\s|/)" + word + "($|\\s|/)";
    } else {
      var begin = cmd(t, "/begin");
      if (begin === "") {
        return ctx.reply("/begin 前段一致，便於匹配動詞變形");
      }
      if (begin) {
        t = "(^|\\s|/)" + begin;
      }
      var begin = undefined;

      var end = cmd(t, "/end");
      if (end === "") return ctx.reply("/end 後段一致匹配");
      if (end) {
        t = end + "($|\\s|/)";
      }
      var end = undefined;
    }
    var word = undefined;
  }

  var t = ctx.message.text.replace(/　/g, " ");
  //const isPage = /( (page|PAGE))? ([0-9]+)/.exec(t)
  const segaments = t.split(" ");
  var page = segaments.slice(-1)[0]; //Cannot be a constant!
  page = /^[0-9]+$/.test(page) ? Number(segaments.pop()) : 1; // pop() 删除&返回数组最后一个元素
  t = segaments.join(" ");

  try {
    var statement, newSort;
    if (/[\u4e00-\u9fa5]+/.test(t)) {
      //ニカン語
      t = await simplify(t);
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
    return ctx.reply("Reg Exp Err" + err);
  }
  db.find(statement, function(err, docs) {
    if (err) {
      console.log(err);
      return ctx.reply(err);
    }

    //DETECT whether t is a regex or plain text
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

    // Markup
    const PGUP = t + " " + (page - 1);
    const PGDN = t + " " + (page + 1);
    var btnArr = [];
    if (page > 1) btnArr.push(["←" + (page - 1), PGUP]); // ! 1st page
    if (page < pagecount) btnArr.push([page + 1 + "→", PGDN]); // ! last page
    console.log("btns", btnArr);
    const pagibtn = Telegraf.Extra.HTML().markup(m =>
      m
        .inlineKeyboard([btnArr.map(btn => m.callbackButton(btn[0], btn[1]))])
        .resize()
    );

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
    ctx.replyWithHTML(o, pagibtn);
  });
});

//inline///////////////////////////////////////////
bot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
  const q = inlineQuery.query;
  var results = [];
  if (manchu.isManchuScript(q)) {
    const res = manchu.deManchurize(q);
    if (res === "") return;
    results = [
      {
        type: "article",
        id: crc32(res),
        title: "Tanscription",
        description: res,
        input_message_content: {
          message_text: res
        },
        thumb_url:
          "https://cdn.glitch.com/e41d8351-01f6-4af8-b0ee-bd4710cb3769%2F5BF7709A-BD2D-47DA-9C00-48A22E619F73.jpeg?v=1569941377839"
      }
    ];
  } else {
    if (/[\u4e00-\u9fa5]+/.test(q)) {
      //nikan jisun
      var res = "nikan jisun";
      results = [
        {
          type: "article",
          id: crc32(res),
          title: "nikan",
          description: res,
          input_message_content: {
            message_text: res
          }
        }
      ];
    } else {
      //transcription
      const res = manchu.Manchurize(q);
      if (res === "") return;
      results = [
        {
          type: "article",
          id: crc32(res),
          title: "Manju gisun",
          description: res,
          input_message_content: {
            message_text: res
          },
          thumb_url:
            "https://cdn.glitch.com/e41d8351-01f6-4af8-b0ee-bd4710cb3769%2F5BF7709A-BD2D-47DA-9C00-48A22E619F73.jpeg?v=1569941377839"
        }
      ];
    }
  }
  //Telegram requests results even if the query is blank when the user typed and deleted

  console.log(JSON.stringify(results));
  return answerInlineQuery(results);
});

bot.launch();
//>>>>>>> glitch
process.on("uncaughtException", function(err) {
  console.log("Caught exception: ", err);
});
