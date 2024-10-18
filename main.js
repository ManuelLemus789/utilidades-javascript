import { UtilNative } from "./util.js";
const util = UtilNative.getInstance(undefined);
console.log(util.isNumber(2));
console.log(util.isEquivalentTo([2, 2], {}));
