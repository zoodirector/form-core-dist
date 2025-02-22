"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function getBy(obj, path) {
  const pathObj = makePathArray(path);
  return pathObj.reduce((current, pathPart) => {
    if (current === null) return null;
    if (typeof current !== "undefined") {
      return current[pathPart];
    }
    return void 0;
  }, obj);
}
function setBy(obj, _path, updater) {
  const path = makePathArray(_path);
  function doSet(parent) {
    if (!path.length) {
      return functionalUpdate(updater, parent);
    }
    const key = path.shift();
    if (typeof key === "string") {
      if (typeof parent === "object") {
        if (parent === null) {
          parent = {};
        }
        return {
          ...parent,
          [key]: doSet(parent[key])
        };
      }
      return {
        [key]: doSet()
      };
    }
    if (Array.isArray(parent) && key !== void 0) {
      const prefix = parent.slice(0, key);
      return [
        ...prefix.length ? prefix : new Array(key),
        doSet(parent[key]),
        ...parent.slice(key + 1)
      ];
    }
    return [...new Array(key), doSet()];
  }
  return doSet(obj);
}
function deleteBy(obj, _path) {
  const path = makePathArray(_path);
  function doDelete(parent) {
    if (!parent) return;
    if (path.length === 1) {
      const finalPath = path[0];
      if (Array.isArray(parent) && typeof finalPath === "number") {
        return parent.filter((_, i) => i !== finalPath);
      }
      const { [finalPath]: remove, ...rest } = parent;
      return rest;
    }
    const key = path.shift();
    if (typeof key === "string") {
      if (typeof parent === "object") {
        return {
          ...parent,
          [key]: doDelete(parent[key])
        };
      }
    }
    if (typeof key === "number") {
      if (Array.isArray(parent)) {
        if (key >= parent.length) {
          return parent;
        }
        const prefix = parent.slice(0, key);
        return [
          ...prefix.length ? prefix : new Array(key),
          doDelete(parent[key]),
          ...parent.slice(key + 1)
        ];
      }
    }
    throw new Error("It seems we have created an infinite loop in deleteBy. ");
  }
  return doDelete(obj);
}
const reFindNumbers0 = /^(\d*)$/gm;
const reFindNumbers1 = /\.(\d*)\./gm;
const reFindNumbers2 = /^(\d*)\./gm;
const reFindNumbers3 = /\.(\d*$)/gm;
const reFindMultiplePeriods = /\.{2,}/gm;
const intPrefix = "__int__";
const intReplace = `${intPrefix}$1`;
function makePathArray(str) {
  if (Array.isArray(str)) {
    return [...str];
  }
  if (typeof str !== "string") {
    throw new Error("Path must be a string.");
  }
  return str.replaceAll("[", ".").replaceAll("]", "").replace(reFindNumbers0, intReplace).replace(reFindNumbers1, `.${intReplace}.`).replace(reFindNumbers2, `${intReplace}.`).replace(reFindNumbers3, `.${intReplace}`).replace(reFindMultiplePeriods, ".").split(".").map((d) => {
    if (d.indexOf(intPrefix) === 0) {
      return parseInt(d.substring(intPrefix.length), 10);
    }
    return d;
  });
}
function isNonEmptyArray(obj) {
  return !(Array.isArray(obj) && obj.length === 0);
}
function getAsyncValidatorArray(cause, options) {
  const { asyncDebounceMs } = options;
  const {
    onChangeAsync,
    onBlurAsync,
    onSubmitAsync,
    onBlurAsyncDebounceMs,
    onChangeAsyncDebounceMs
  } = options.validators || {};
  const defaultDebounceMs = asyncDebounceMs ?? 0;
  const changeValidator = {
    cause: "change",
    validate: onChangeAsync,
    debounceMs: onChangeAsyncDebounceMs ?? defaultDebounceMs
  };
  const blurValidator = {
    cause: "blur",
    validate: onBlurAsync,
    debounceMs: onBlurAsyncDebounceMs ?? defaultDebounceMs
  };
  const submitValidator = {
    cause: "submit",
    validate: onSubmitAsync,
    debounceMs: 0
  };
  const noopValidator = (validator) => ({ ...validator, debounceMs: 0 });
  switch (cause) {
    case "submit":
      return [
        noopValidator(changeValidator),
        noopValidator(blurValidator),
        submitValidator
      ];
    case "blur":
      return [blurValidator];
    case "change":
      return [changeValidator];
    case "server":
    default:
      return [];
  }
}
function getSyncValidatorArray(cause, options) {
  const { onChange, onBlur, onSubmit } = options.validators || {};
  const changeValidator = { cause: "change", validate: onChange };
  const blurValidator = { cause: "blur", validate: onBlur };
  const submitValidator = { cause: "submit", validate: onSubmit };
  const serverValidator = {
    cause: "server",
    validate: () => void 0
  };
  switch (cause) {
    case "submit":
      return [
        changeValidator,
        blurValidator,
        submitValidator,
        serverValidator
      ];
    case "server":
      return [serverValidator];
    case "blur":
      return [blurValidator, serverValidator];
    case "change":
    default:
      return [changeValidator, serverValidator];
  }
}
exports.deleteBy = deleteBy;
exports.functionalUpdate = functionalUpdate;
exports.getAsyncValidatorArray = getAsyncValidatorArray;
exports.getBy = getBy;
exports.getSyncValidatorArray = getSyncValidatorArray;
exports.isNonEmptyArray = isNonEmptyArray;
exports.makePathArray = makePathArray;
exports.setBy = setBy;
//# sourceMappingURL=utils.cjs.map
