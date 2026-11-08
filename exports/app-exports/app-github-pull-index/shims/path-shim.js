const fs = require("fs");
const path = require("path");

module.exports = {
  join: (...parts) => parts.join("/").replace(/\/+/g, "/").replace(/^\/+/, ""),
  basename: (p) => String(p).split("/").pop() || p,
  dirname: (p) => String(p).split("/").slice(0, -1).join("/"),
  extname: (p) => {
    const b = String(p).split("/").pop();
    const i = b.lastIndexOf(".");
    return i > 0 ? b.slice(i) : "";
  }
};