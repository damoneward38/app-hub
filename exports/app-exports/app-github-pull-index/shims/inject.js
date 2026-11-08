const fs = require("./fs-shim.js");
const path = require("./path-shim.js");
const axios = require("./axios-shim.js");
const nodemailer = require("./nodemailer-shim.js");
const { OpenAIApi, Configuration } = require("./openai-shim.js");

globalThis.Buffer = globalThis.Buffer || {
  from: (b) => b
};

export { fs, path, axios, nodemailer, OpenAIApi, Configuration };
export const process = { env: {} };