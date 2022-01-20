"use strict";
/**
 * Hello world
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardFunds = exports.transferAmountWithKey = exports.transferAmount = exports.createSolanaAccount = exports.getStatesAccountInfo = exports.getAccountInfo = exports.initSolana = void 0;
const web3_js_1 = require("@solana/web3.js");
const solana_transfers_1 = require("./solana_transfers");
function initSolana() {
    return __awaiter(this, void 0, void 0, function* () {
        // Establish connection to the cluster
        yield (0, solana_transfers_1.establishConnection)();
        // Determine who pays for the fees
        yield (0, solana_transfers_1.establishPayer)();
        // Check if the program has been deployed
        yield (0, solana_transfers_1.checkProgram)();
        // Create states Account, that will be passed with each transaction
        yield (0, solana_transfers_1.createStatesSavingAccount)();
    });
}
exports.initSolana = initSolana;
function getAccountInfo(account) {
    return __awaiter(this, void 0, void 0, function* () {
        let pub_key_cast = new web3_js_1.PublicKey(account);
        console.log("\nACCOUNT INFO, ", account);
        yield (0, solana_transfers_1.get_account_info)(pub_key_cast);
    });
}
exports.getAccountInfo = getAccountInfo;
function getStatesAccountInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield (0, solana_transfers_1.get_states_account_info)();
        return result.account_maps;
    });
}
exports.getStatesAccountInfo = getStatesAccountInfo;
function createSolanaAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        let account = yield (0, solana_transfers_1.createAccount)();
        return account.toString();
    });
}
exports.createSolanaAccount = createSolanaAccount;
function transferAmount(src, dest, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, solana_transfers_1.transferLamport)(new web3_js_1.PublicKey(src), new web3_js_1.PublicKey(dest), amount);
    });
}
exports.transferAmount = transferAmount;
function transferAmountWithKey(src, dest, amount, key) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, solana_transfers_1.transferLamport)(new web3_js_1.PublicKey(src), new web3_js_1.PublicKey(dest), amount, key);
    });
}
exports.transferAmountWithKey = transferAmountWithKey;
function forwardFunds(src, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, solana_transfers_1.forward_funds)(new web3_js_1.PublicKey(src), new web3_js_1.PublicKey(dest));
    });
}
exports.forwardFunds = forwardFunds;
