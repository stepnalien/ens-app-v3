"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var errors_exports = {};
__export(errors_exports, {
  ENSJSError: () => ENSJSError,
  returnOrThrow: () => returnOrThrow
});
module.exports = __toCommonJS(errors_exports);
class ENSJSError extends Error {
  constructor({
    name,
    data,
    timestamp
  }) {
    super();
    this.name = name;
    this.data = data;
    this.timestamp = timestamp;
  }
}
const debugFlow = async (data, meta, provider) => {
  var _a;
  if (!meta)
    return;
  const testName = localStorage.getItem("ensjs-debug") || "";
  if (testName === "ENSJSSubgraphIndexingError") {
    const blockNumber = (_a = meta == null ? void 0 : meta.block) == null ? void 0 : _a.number;
    const block = blockNumber ? await (provider == null ? void 0 : provider.getBlock(blockNumber - 1)) : void 0;
    const timestamp = block == null ? void 0 : block.timestamp;
    throw new ENSJSError({
      name: "ENSJSSubgraphIndexingError",
      data,
      timestamp
    });
  }
  if (testName === "ENSJSUnknownError") {
    throw new ENSJSError({
      name: "ENSJSUnknownError"
    });
  }
  if (testName === "ENSJSNetworkLatencyError") {
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 1e4);
    });
  }
};
const returnOrThrow = async (data, meta, provider) => {
  var _a;
  if (true) {
    await debugFlow(data, meta, provider);
  }
  if ((meta == null ? void 0 : meta.hasIndexingErrors) && provider) {
    const blockNumber = (_a = meta.block) == null ? void 0 : _a.number;
    const block = await (provider == null ? void 0 : provider.getBlock(blockNumber));
    const timestamp = block == null ? void 0 : block.timestamp;
    throw new ENSJSError({
      name: "ENSJSSubgraphIndexingError",
      timestamp,
      data
    });
  }
  return data;
};
