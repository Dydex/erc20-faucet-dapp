import { useCallback, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useTokenContract } from "../useContracts";
import { toast } from "react-toastify";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export const useReadContract = () => {
  const { address } = useAppKitAccount();
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  const publicContract = useTokenContract(false);
  const userContract = useTokenContract(true);

  const getPublicData = useCallback(async () => {
    if (!publicContract) return null;
    try {
      setIsLoadingPublic(true);
      
      const [fAmount, supply, total, n, s, owner, contractBal] = await Promise.all([
        publicContract.faucetAmount().catch(() => null),
        publicContract.maxsupply().catch(() => null),
        publicContract.totalSupply().catch(() => null),
        publicContract.name().catch(() => ''),
        publicContract.symbol().catch(() => ''),
        publicContract.owner().catch((e) => { console.error("Owner fetch error:", e); return '' }),
        publicContract.balanceOf(CONTRACT_ADDRESS).catch(() => null)
      ]);

      return {
        faucetAmount: fAmount,
        maxSupply: supply,
        totalSupply: total,
        name: n,
        symbol: s,
        owner: owner,
        contractBal: contractBal
      };
    } catch (error) {
      console.error("Error reading public data:", error);
      toast.error("Failed to read public token data.");
      return null;
    } finally {
      setIsLoadingPublic(false);
    }
  }, [publicContract]);

  const getUserData = useCallback(async () => {
    if (!userContract || !address) return null;
    
    try {
      setIsLoadingUser(true);
      
      const [balance, remaining, lastClaim] = await Promise.all([
        userContract.balanceOf(address).catch(() => null),
        userContract.remainingTime().catch(() => null),
        userContract.lastClaimed(address).catch(() => null)
      ]);
      
      let calcRemaining = remaining;
      if (lastClaim && lastClaim > 0n) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        const diff = now - lastClaim;
        calcRemaining = diff < 86400n ? (86400n - diff) : 0n;
      }

      return {
        tokenBalance: balance,
        timeRemaining: calcRemaining
      };
    } catch (error) {
      console.error("Error reading user data:", error);
      toast.error("Failed to read your token balance.");
      return null;
    } finally {
      setIsLoadingUser(false);
    }
  }, [userContract, address]);

  return { getPublicData, getUserData, isLoadingPublic, isLoadingUser };
};
