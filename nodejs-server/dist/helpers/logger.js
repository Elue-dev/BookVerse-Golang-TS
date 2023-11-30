"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showLogs = void 0;
function showLogs(helper, data) {
    const formattedLog = JSON.stringify(data, null, 2);
    console.log(`${helper} =>`, formattedLog);
}
exports.showLogs = showLogs;
