import { unhex } from ".";

export interface UnidbgConfig {
    signKey: Uint8Array;
    aid: string;
    licenseId: string;
    sdkVersion: string;
    sdkVersionInt: number;
    callType: number;
}

export const defaultUnidbgConfig: UnidbgConfig = {
    signKey: new Uint8Array(
        unhex("ac1adaae95a7af94a5114ab3b3a97dd80050aa0a39314c40528caec95256c28c"),
    ),
    aid: "1967",
    licenseId: "1611921764",
    sdkVersion: "v04.04.05-ov-android",
    sdkVersionInt: 134744640,
    callType: 738,
};
