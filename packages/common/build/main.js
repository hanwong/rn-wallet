"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlank = exports.isObject = exports.isEmpty = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const isEmpty = (data) => data === null || data === undefined;
exports.isEmpty = isEmpty;
const isObject = (data) => data && typeof data === 'object';
exports.isObject = isObject;
const isBlank = (data) => (0, exports.isEmpty)(data) ||
    (Array.isArray(data) && data.length === 0) ||
    ((0, exports.isObject)(data) && Object.keys(data).length === 0) ||
    (typeof data === 'string' && data.trim().length === 0);
exports.isBlank = isBlank;
//# sourceMappingURL=main.js.map