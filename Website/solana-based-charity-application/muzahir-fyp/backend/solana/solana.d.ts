/**
 * Hello world
 */
export declare function initSolana(): Promise<void>;
export declare function getAccountInfo(account: string): Promise<void>;
export declare function getStatesAccountInfo(): Promise<Map<string, number>>;
export declare function createSolanaAccount(): Promise<string>;
export declare function transferAmount(src: string, dest: string, amount: number): Promise<void>;
export declare function transferAmountWithKey(src: string, dest: string, amount: number, key: string): Promise<void>;
export declare function forwardFunds(src: string, dest: string): Promise<void>;
