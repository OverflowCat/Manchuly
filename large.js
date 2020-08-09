const manchu = require("./ManchuCore");
const Database = require("better-sqlite3");
const db = new Database("dic.db", { verbose: console.log });
const insert = db.prepare()