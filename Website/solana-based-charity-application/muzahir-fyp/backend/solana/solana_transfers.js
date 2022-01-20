"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_states_account_info = exports.forward_funds = exports.get_account_info = exports.transferLamport = exports.createAccount = exports.createStatesSavingAccount = exports.checkProgram = exports.establishPayer = exports.establishConnection = exports.printValues = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_js_1 = __importDefault(require("mz/fs.js"));
const path_1 = __importDefault(require("path"));
const borsh = __importStar(require("borsh"));
const utils_js_1 = require("./utils.js");
/**
 * Seed values
 */
let seed = 1;
/**
 * Connection to the network
 */
let connection;
/**
 * Keypair associated to the fees' payer
 */
let payer;
/**
 * Program id
 */
let programId;
/**
 * Air Drop Amount
 */
const AIRDROP_AMOUNT = 500;
/**
 * States Account data size
 */
const STATES_DATA_SIZE = 1024;
/**
 * State Saving Account
 */
var states_account = undefined;
/**
 * Path to program files
 */
const PROGRAM_PATH = path_1.default.resolve("/home/muzahir/Desktop/Solana/transfer-lamports/dist/program");
/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path_1.default.join(PROGRAM_PATH, 'spl_example_transfer_lamports.so');
/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/helloworld.so`
 */
const PROGRAM_KEYPAIR_PATH = path_1.default.join(PROGRAM_PATH, 'spl_example_transfer_lamports-keypair.json');
// Variable to hold the amount to send between accounts
class KeyMap extends web3_js_1.Struct {
    // Called when deserializing
    constructor(fields) {
        super(fields);
        this.initialized = !!this.initialized; // Convert 0/1 to false/true boolean
    }
}
const KeyMapSchema = new Map([
    [
        KeyMap,
        {
            kind: 'struct',
            fields: [
                ['initialized', 'u8'],
                ['length', 'u32'],
                ["account_maps",
                    {
                        // Outter map
                        kind: 'map',
                        key: 'string',
                        value: 'u64',
                    }]
            ]
        }
    ],
]);
class InstructionData {
    constructor(fields = undefined) {
        this.amount = 0;
        this.key = "";
        if (fields) {
            this.amount = fields.amount;
            this.key = fields.key;
        }
    }
}
/**
 * Borsh schema definition for InstructionData struct
 */
const InstructionDataSchema = new Map([
    [InstructionData, { kind: 'struct', fields: [['amount', 'u64'], ['key', 'string']] }],
]);
const AMOUNT_SIZE = borsh.serialize(InstructionDataSchema, new InstructionData()).length;
/**
 * Print values for testing
 */
function printValues() {
    return __awaiter(this, void 0, void 0, function* () {
        __dirname;
        console.log('__dirname: ', __dirname);
        console.log('PROGRAM_PATH: ', PROGRAM_PATH);
        console.log('PROGRAM_SO_PATH: ', PROGRAM_SO_PATH);
        console.log('PROGRAM_KEYPAIR_PATH: ', PROGRAM_KEYPAIR_PATH);
    });
}
exports.printValues = printValues;
/**
 * Establish a connection to the cluster
 */
function establishConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcUrl = yield (0, utils_js_1.getRpcUrl)();
        connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
        const version = yield connection.getVersion();
        console.log('Connection to cluster established:', rpcUrl, version);
    });
}
exports.establishConnection = establishConnection;
/**
 * Establish an account to pay for everything
 */
function establishPayer() {
    return __awaiter(this, void 0, void 0, function* () {
        let fees = 0;
        if (!payer) {
            const { feeCalculator } = yield connection.getRecentBlockhash();
            // Calculate the cost to fund the greeter account
            fees += yield connection.getMinimumBalanceForRentExemption(AMOUNT_SIZE);
            // Calculate the cost of sending transactions
            fees += feeCalculator.lamportsPerSignature * 100; // wag
            payer = yield (0, utils_js_1.getPayer)();
        }
        let lamports = yield connection.getBalance(payer.publicKey);
        if (lamports < fees) {
            // If current balance is not enough to pay for fees, request an airdrop
            const sig = yield connection.requestAirdrop(payer.publicKey, fees - lamports);
            yield connection.confirmTransaction(sig);
            lamports = yield connection.getBalance(payer.publicKey);
        }
        console.log('Using account', payer.publicKey.toBase58(), 'containing', lamports / web3_js_1.LAMPORTS_PER_SOL, 'SOL to pay for fees');
    });
}
exports.establishPayer = establishPayer;
/**
 * Check if the hello world BPF program has been deployed
 */
function checkProgram() {
    return __awaiter(this, void 0, void 0, function* () {
        // Read program id from keypair file
        try {
            const programKeypair = yield (0, utils_js_1.createKeypairFromFile)(PROGRAM_KEYPAIR_PATH);
            programId = programKeypair.publicKey;
        }
        catch (err) {
            const errMsg = err.message;
            throw new Error(`Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``);
        }
        // Check if the program has been deployed
        const programInfo = yield connection.getAccountInfo(programId);
        if (programInfo === null) {
            if (fs_js_1.default.existsSync(PROGRAM_SO_PATH)) {
                throw new Error('Program needs to be deployed with `solana program deploy dist/program/helloworld.so`');
            }
            else {
                throw new Error('Program needs to be built and deployed');
            }
        }
        else if (!programInfo.executable) {
            throw new Error(`Program is not executable`);
        }
        console.log(`Using program ${programId.toBase58()}`);
    });
}
exports.checkProgram = checkProgram;
/**
 * Create single Account for state saving
 */
function createStatesSavingAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(states_account === undefined)) {
            return states_account;
        }
        // Here, we would create an account and store it on the database.
        const SEED = String(++seed);
        let pubkey = yield web3_js_1.PublicKey.createWithSeed(payer.publicKey, SEED, programId);
        const account = yield connection.getAccountInfo(pubkey);
        if (account === null) { // if key doesnot exist already, create it
            const lamports = yield connection.getMinimumBalanceForRentExemption(STATES_DATA_SIZE);
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccountWithSeed({
                fromPubkey: payer.publicKey,
                basePubkey: payer.publicKey,
                seed: SEED,
                newAccountPubkey: pubkey,
                lamports: lamports,
                space: STATES_DATA_SIZE,
                programId,
            }));
            yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
        }
        states_account = pubkey;
    });
}
exports.createStatesSavingAccount = createStatesSavingAccount;
/**
 * Create Accounts
 */
function createAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
        // Here, we would create an account and store it on the database.
        const SEED = String(++seed);
        let pubkey = yield web3_js_1.PublicKey.createWithSeed(payer.publicKey, SEED, programId);
        const account = yield connection.getAccountInfo(pubkey);
        if (account === null) { // if key doesnot exist already, create it
            const lamports = yield connection.getMinimumBalanceForRentExemption(AMOUNT_SIZE);
            console.log("Minimum balance for Rent Exemption: ", lamports);
            const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccountWithSeed({
                fromPubkey: payer.publicKey,
                basePubkey: payer.publicKey,
                seed: SEED,
                newAccountPubkey: pubkey,
                lamports: lamports,
                space: AMOUNT_SIZE,
                programId,
            }));
            yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
        }
        return pubkey;
    });
}
exports.createAccount = createAccount;
/**
 * Transfer Lamports
 */
function transferLamport(src, destination, amt, key) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("STATES SAVING ACCOUNT: ", states_account);
        let map_key = "";
        if (key == null)
            map_key = src.toString() + "_" + destination.toString();
        else
            map_key = key;
        const instruction_data = new InstructionData({
            amount: amt,
            key: map_key
        });
        const serialized_amount = Buffer.from(borsh.serialize(InstructionDataSchema, instruction_data));
        const instruction = new web3_js_1.TransactionInstruction({
            keys: [
                { pubkey: src, isSigner: false, isWritable: true },
                { pubkey: destination, isSigner: false, isWritable: true },
                { pubkey: states_account, isSigner: false, isWritable: true } // exclamation mark to use the pubkey property os states_account
            ],
            programId,
            data: serialized_amount,
        });
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, new web3_js_1.Transaction().add(instruction), [payer]);
    });
}
exports.transferLamport = transferLamport;
function get_account_info(src) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountInfo = yield connection.getAccountInfo(src);
        if (accountInfo === null) {
            throw 'Error: cannot find the account';
        }
        const details = borsh.deserialize(InstructionDataSchema, InstructionData, accountInfo.data);
        //console.log('Account Info\nId: ', accountInfo.owner.toBase58(), '\nBalance', accountInfo.lamports, '\n');
        console.log('Account Info\nId: ', src.toBase58(), '\nBalance', accountInfo.lamports, '\n');
    });
}
exports.get_account_info = get_account_info;
// Will be used by the admin
// will received organization account in from (this is the account where donors will be sending), and another organization account in to.
function forward_funds(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const kmap_deser = yield get_states_account_info();
        // iterate through the dictionary
        for (const key of kmap_deser.account_maps.keys()) {
            if (key.endsWith(from.toString())) { // find the key, get its value
                let amount = Number(kmap_deser.account_maps.get(key).toString());
                let sender = key.split("_")[0];
                let map_key = sender.toString() + "_" + to.toString();
                yield transferLamport(new web3_js_1.PublicKey(from), to, amount, map_key);
                // console.log("Key: ", key.toString());
                // console.log("Sender: ", sender.toString());
                // console.log("From: ", from);
                // console.log("To: ", to.toString());      
            }
        }
        return false;
    });
}
exports.forward_funds = forward_funds;
function get_states_account_info() {
    return __awaiter(this, void 0, void 0, function* () {
        const accountInfo = yield connection.getAccountInfo(states_account);
        if (accountInfo === null) {
            throw 'Error: cannot find the account';
        }
        //console.log("\nBase64 encoded data\n", accountInfo.data);
        //console.log("\nBase64 encoded data\n", accountInfo.data.toString('base64'))
        const kmap_deser = borsh.deserializeUnchecked(KeyMapSchema, KeyMap, accountInfo.data);
        //console.log("Deserialized Data: ", kmap_deser);
        //console.log("Deserialized Data: ", kmap_deser.account_maps);
        // kmap_deser.account_maps.forEach((value: number, key: string) => {
        //   console.log(key, value.toString());
        // });
        return kmap_deser;
    });
}
exports.get_states_account_info = get_states_account_info;
