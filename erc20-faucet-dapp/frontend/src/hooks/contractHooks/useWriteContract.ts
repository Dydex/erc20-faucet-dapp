import { useAppKitAccount } from "@reown/appkit/react";
import { useTokenContract } from "../useContracts";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { ErrorDecoder, type DecodedError } from "ethers-decode-error";
import { TOKEN_ABI } from "../../ABI/token";

export const useWriteFunctions = () => {
  const tokenContract = useTokenContract(true);
  const { address } = useAppKitAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  // @ts-expect-error: Ethers CJS/ESM dual-package hazard on Interface type
  const errorDecoder = ErrorDecoder.create([new ethers.Interface(TOKEN_ABI)]);

  const claimToken = useCallback(
    async () => {
      if (!tokenContract) {
        toast.error("token contract not found!");
        return false;
      }
      if (!address) {
        toast.error("address is not found!");
        return false;
      }
      try {
        setIsClaiming(true);
        const claimTx = await tokenContract.requestToken();
        const receipt = await claimTx.wait();
        return receipt.status === 1;
      } catch (error) {
        console.error(error);
        const decodedError: DecodedError = await errorDecoder.decode(error);
        toast.error(decodedError.reason || "Transaction failed");
        return false;
      } finally {
        setIsClaiming(false);
      }
    },
    [tokenContract, address, errorDecoder]
  );

  const transferToken = useCallback(
    async (amount: string, receiver: string) => {
      if (!tokenContract) {
        toast.error("token contract not found!");
        return false;
      }
      try {
        setIsTransferring(true);
        const amt = ethers.parseUnits(amount, 18);
        const transferTx = await tokenContract.transfer(receiver, amt);
        const receipt = await transferTx.wait();
        return receipt.status === 1;
      } catch (error) {
        console.error(error);
        const decodedError: DecodedError = await errorDecoder.decode(error);
        toast.error(decodedError.reason || "Transaction failed");
        return false;
      } finally {
        setIsTransferring(false);
      }
    },
    [tokenContract, errorDecoder]
  );

  const mintToken = useCallback(
    async (amount: string, receiver: string) => {
      if (!tokenContract) {
        toast.error("token contract not found!");
        return false;
      }
      if (!address) {
        toast.error("address is not found!");
        return false;
      }
      try {
        setIsMinting(true);
        const amt = ethers.parseUnits(amount, 18);
        const mintTx = await tokenContract.mint(receiver, amt);
        const receipt = await mintTx.wait();
        return receipt.status === 1;
      } catch (error) {
        console.error(error);
        const decodedError: DecodedError = await errorDecoder.decode(error);
        toast.error(decodedError.reason || "Transaction failed");
        return false;
      } finally {
        setIsMinting(false);
      }
    },
    [tokenContract, address, errorDecoder]
  );

  return { claimToken, mintToken, transferToken, isClaiming, isMinting, isTransferring };
};
