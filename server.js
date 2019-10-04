//var fundebug = require("fundebug-nodejs");
//fundebug.apikey = process.env.FUNDEBUG
const express = require("express");
const app = express();
const http = require("http");
const manchu = require("./ManchuCore");
const fs = require("fs");
var simplify = require("hanzi-tools").simplify;
const crc32 = require("./rdm.js").crc32;
function tag(text, tag) {
  return "<" + tag + ">" + text + "</" + tag + ">";
}

app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  app.get("/", (request, response) => {
    console.log(Date.now() + " Ping Received");
    response.sendStatus(200);
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + process.env.PORT);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const _ = require("lodash/object");
const csvFilePath = "dicts.csv";
const csv = require("csvtojson");
var Datastore = require("nedb"),
  db = new Datastore();

csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    var trimmed = jsonObj.map(i => {
      i.zh = i.zh.split(" | ");
      i.m = i.m.replace(/&nbsp;/g, " ");
      i.r = i.r.replace(/&nbsp;/g, " ");
      return _.pick(i, ["m", "r", "zh"]);
    });
    db.insert(trimmed, function(err, newDoc) {});
  });

const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((ctx, next) => {
  const start = new Date();
  return next(ctx).then(() => {
    const ms = new Date() - start;
    console.log("Response time %sms", ms);
  });
});

const chars = "^{()}[]$".split;
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

bot.on("text", ctx => {
  var t = ctx.message.text;

  if (t.indexOf("/") == 0) {
    if (t == "/start") {
      ctx.replyWithPhoto({
        url:
          "https://cdn.glitch.com/e41d8351-01f6-4af8-b0ee-bd4710cb3769%2FA7BA13F8-3D6B-475B-9D23-98649A31754E.jpeg?v=1569678896904"
      });
      return ctx.replyWithHTML(
        "欢迎使用 @OverflowCat 的满洲里 bot。阁下可以使用满语、转写或中文查询满语词汇。Github repo: https://github.com/OverflowCat/Manchuly"
      );
    }
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

  try {
    var statement, newSort;
    if (/[\u4e00-\u9fa5]+/.test(t)) {
      t = simplify(t);
      statement = { zh: new RegExp(t, "gm") };
      newSort = function(array) {
        // Sort with length
        array = array.sort(function(a, b) {
          return a.zh.join("；").length - b.zh.join("；").length;
        });
        // Sort with whole word match
        array = array.sort(function(a, b) {
          a = a.zh.includes(simplify(t));
          b = b.zh.includes(simplify(t));
          return b - a;
        });
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

    //docs = docs.slice(1)
    //DETECT whether t is a regex or plain text
    if (!realRegex(t)) {
      docs = newSort(docs);
    }

    var l = docs.length;
    var o = t.bold() + " with ".italics();
    if (l > 30) {
      docs = docs.slice(0, 20);
      o += "20 of ".italics();
    }
    o += l + " result".italics();
    if (l > 1) {
      o += "s".italics();
    }
    if (l != 0) {
      o += ":\n".italics();
    }

    docs.map(e => {
      o +=
        "- " +
        [e.m.bold(), tag(e.r, "code"), e.zh.join("；")].join(" | ") +
        "\n";
    });
    //<<<<<<< patch-1
    o = o.replace("undefined", "");
    ctx.replyWithHTML(o);
  });
});
bot.command("start", ctx => {});
//=======

//inline
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
