const express = require("express");
const app = express();
const http = require("http");
const manchu = require("./ManchuCore");
const fs = require("fs");

const userdb = require("./user");
const replaceall = require("replaceall");

const lookup = require("./lookup");

//userdb.c(114514, "lang", "zh_classic");
//userdb.c(114515, "lang", "zh_classic");
//const diskord = require('./diskord')
//var simplify = require("hanzi-tools").simplify;

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
const Telegraf = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((ctx, next) => {
  const start = new Date();
  return next(ctx).then(() => {
    const ms = new Date() - start;
    console.log("Response time %sms", ms);
  });
});

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
  var t = ctx.message.text;
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

  if (false) {
    var page = 3;
    var pagecount = 6;
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
  }
  var findings = await lookup.any(t, "privatechat");
  console.log(findings);
  return ctx.replyWithHTML(findings[1]);
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
