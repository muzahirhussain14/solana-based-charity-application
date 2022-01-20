import { Keypair } from '@solana/web3.js';
/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export declare function getRpcUrl(): Promise<string>;
/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export declare function getPayer(): Promise<Keypair>;
/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export declare function createKeypairFromFile(filePath: string): Promise<Keypair>;
