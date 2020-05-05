"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.PRE_PARAM_VALUE_TAG = '~pre~';
exports.POST_PARAM_VALUE_TAG = '~post~';
const taggedParamsValues = new RegExp(`${exports.PRE_PARAM_VALUE_TAG}(.*?)${exports.POST_PARAM_VALUE_TAG}`, 'gm');
exports.transformPathParamsValues = (path, transform) => {
    return path.replace(taggedParamsValues, transform('$1'));
};
exports.attachTagsToParamsValues = values => {
    return lodash_1.mapValues(values, attachPrePostTags);
};
const attachPrePostTags = (paramValue) => {
    return lodash_1.isArray(paramValue)
        ? paramValue.map(v => `${exports.PRE_PARAM_VALUE_TAG}${v}${exports.POST_PARAM_VALUE_TAG}`)
        : `${exports.PRE_PARAM_VALUE_TAG}${paramValue}${exports.POST_PARAM_VALUE_TAG}`;
};
