"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBrowser = detectBrowser;
function detectBrowser(userAgent) {
    if (/Edg\//i.test(userAgent))
        return "Edge";
    if (/OPR\//i.test(userAgent))
        return "Opera";
    if (/Firefox\//i.test(userAgent))
        return "Firefox";
    if (/Chrome\//i.test(userAgent))
        return "Chrome";
    if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent))
        return "Safari";
    return "Other";
}
//# sourceMappingURL=browserUtils.js.map