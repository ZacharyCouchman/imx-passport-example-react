import { 
  useWalletInfo, useDisconnect, useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react';
import './ExternalWallets.css';
import { passportInstance, passportProvider } from '../utils/passport';
import { useCallback, useEffect, useState } from 'react';
import { generateNonce } from 'siwe';
import { mainnet } from '../utils/config';

export const ExternalWallets = () => {
  const {open} = useWeb3Modal()
  const {disconnect} = useDisconnect();
  const { walletProvider } = useWeb3ModalProvider();
  const {address, chainId} = useWeb3ModalAccount();
  const {walletInfo} = useWalletInfo();

  // Linked Wallets
  const [linkedWallets, setLinkedWallets] = useState<string[] | undefined>(undefined);
  // External Wallets
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [intentToLinkWallet, setIntentToLinkWallet] = useState(false)

  async function fetchLinkedWallets() {
    const linkedAddresses = await passportInstance.getLinkedAddresses();
    console.log("Passport linked wallets: ", linkedAddresses);
    setLinkedWallets(linkedAddresses);
  }

  const linkWallet = useCallback(async () => {
    if(!walletProvider || !walletProvider.request) return;
    setIntentToLinkWallet(true);
    if(chainId !== mainnet.chainId) {
      alert("You'll need to switch to the Ethereum network in your wallet before linking it to Passport.")
      open({view: 'Networks'})
      return;
    }

    setIntentToLinkWallet(false);
    setLoadingExternal(true);
    let accounts: string[] = [];
    let nonce = '';
    try {
      accounts = await passportProvider.request({method: 'eth_requestAccounts'});
      nonce = generateNonce();
    } catch(e) {
      console.error(e);
      return;
    } finally{
      setLoadingExternal(false);
    }

    const typedData = {
      domain: {
        chainId: mainnet.chainId,
      },
      message: {
        walletAddress: address.toLowerCase(),
        immutablePassportAddress: accounts[0].toLowerCase(),
        condition: "I agree to link this wallet to my Immutable Passport account.",
        nonce
      },
      primaryType: "LinkWallet",
      types: {
        EIP712Domain: [
          {
            name: "chainId",
            type: "uint256"
          }
        ],
        LinkWallet: [
          {
            name: "walletAddress",
            type: "address"
          },
          {
            name: "immutablePassportAddress",
            type: "address"
          },
          {
            name: "condition",
            type: "string"
          },
          {
            name: "nonce",
            type: "string"
          }
        ]
      }
    }
    let signature = '';
    try{
      // get signature from Passport
      signature = await walletProvider.request({
        method: 'eth_signTypedData_v4',
        params: [
          address.toLowerCase(),
          typedData
        ]
      });

      console.log(signature);
    } catch(e) {
      console.log(e);
      return;
    } finally {
      setLoadingExternal(false);
    }
    
    try {
      const result = await passportInstance.linkExternalWallet({
        type: walletInfo?.rdns as string || '', // This must be a valid rdns, hardcoding to MetaMask for now
        walletAddress: address.toLowerCase(),
        signature: signature,
        nonce: nonce
      });
      alert(`Successfully linked ${result.address}`)
      setTimeout(() => fetchLinkedWallets(), 200);
    } catch (e: unknown) {
      // handle error
      console.error("There was an error linking the external wallet to Passport");
      console.error(e);
      alert(e);
    } finally {
      setLoadingExternal(false);
    }
  }, [walletProvider, address, chainId, open, walletInfo])

  useEffect(() => {
    if(chainId === mainnet.chainId && intentToLinkWallet){
      linkWallet();
    }
  }, [chainId, intentToLinkWallet, linkWallet])

  return (
    <div className='external-wallets-section'>
      <div className='user-info-row'>
        <p><strong>External Wallets</strong></p><button onClick={() => fetchLinkedWallets()}>Get Linked Wallets</button>
      </div>
      {linkedWallets && linkedWallets.length > 0 && linkedWallets.map((address) => (<p key={address} className='wallet-address'>{address}</p>))}
      {linkedWallets && linkedWallets.length === 0 && (<p>There are no externally linked wallets with this Passport</p>)}
      <div className='user-info-row'>
        <p><strong>Link an external wallet</strong></p>
        {!walletProvider && !loadingExternal && <button onClick={() => open()}>Connect EOA Wallet</button>}
        {walletProvider && !loadingExternal &&<><button onClick={disconnect}>Disconnect</button><button onClick={() => linkWallet()}>Link External Wallet</button></> }
        {loadingExternal && <p>Loading...</p>}
      </div>
    </div>
  )
}
