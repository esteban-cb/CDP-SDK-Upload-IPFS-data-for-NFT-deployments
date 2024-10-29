// utils/pinataConfig.ts
import { PinataSDK } from "pinata-web3";

const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

if (!pinataJwt || !pinataGateway) {
  throw new Error("Missing Pinata credentials in environment variables.");
}

export const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
});
