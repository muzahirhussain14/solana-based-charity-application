import { PublicKey, Struct } from '@solana/web3.js';
declare class KeyMap extends Struct {
    initialized: boolean;
    length: number;
    account_maps: Map<string, number>;
    constructor(fields: any);
}
/**
 * Print values for testing
 */
export declare function printValues(): Promise<void>;
/**
 * Establish a connection to the cluster
 */
export declare function establishConnection(): Promise<void>;
/**
 * Establish an account to pay for everything
 */
export declare function establishPayer(): Promise<void>;
/**
 * Check if the hello world BPF program has been deployed
 */
export declare function checkProgram(): Promise<void>;
/**
 * Create single Account for state saving
 */
export declare function createStatesSavingAccount(): Promise<PublicKey>;
/**
 * Create Accounts
 */
export declare function createAccount(): Promise<PublicKey>;
/**
 * Transfer Lamports
 */
export declare function transferLamport(src: PublicKey, destination: PublicKey, amt: number, key?: string): Promise<void>;
export declare function get_account_info(src: PublicKey): Promise<void>;
export declare function forward_funds(from: PublicKey, to: PublicKey): Promise<boolean>;
export declare function get_states_account_info(): Promise<KeyMap>;
export {};
