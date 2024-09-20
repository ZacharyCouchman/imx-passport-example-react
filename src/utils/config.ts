import { Environment } from "@imtbl/sdk/x";
import { defaultConfig } from "@web3modal/ethers5/react"

/**
 * Application Configuration
 */

export const applicationEnvironment = import.meta.env.VITE_IMMUTABLE_ENVIRONMENT.toLowerCase() === Environment.PRODUCTION
  ? Environment.PRODUCTION
  : Environment.SANDBOX;

export const immutablePublishableKey: string = applicationEnvironment === Environment.PRODUCTION
  ? import.meta.env.VITE_PRODUCTION_IMMUTABLE_PUBLISHABLE_KEY
  : import.meta.env.VITE_SANDBOX_IMMUTABLE_PUBLISHABLE_KEY;

export const passportClientId: string = applicationEnvironment === Environment.PRODUCTION
  ? import.meta.env.VITE_PRODUCTION_PASSPORT_CLIENT_ID
  : import.meta.env.VITE_SANDBOX_PASSPORT_CLIENT_ID;

export const passportRedirectUri: string = applicationEnvironment === Environment.PRODUCTION
  ? import.meta.env.VITE_PRODUCTION_PASSPORT_LOGIN_REDIRECT_URI
  : import.meta.env.VITE_SANDBOX_PASSPORT_LOGIN_REDIRECT_URI;

export const passportLogoutRedirectUri: string = applicationEnvironment === Environment.PRODUCTION
  ? import.meta.env.VITE_PRODUCTION_PASSPORT_LOGOUT_REDIRECT_URI
  : import.meta.env.VITE_SANDBOX_PASSPORT_LOGOUT_REDIRECT_URI;

export const passportDashboardUrl: string = applicationEnvironment === Environment.PRODUCTION
  ? "https://passport.immutable.com"
  : "https://passport.sandbox.immutable.com";

export const twaTestMode: boolean = import.meta.env.VITE_TWA_TEST_MODE === "true" || import.meta.env.VITE_TWA_TEST_MODE === true;


/**
 * Web3Modal Configuration
 */

// 1. Get projectId
export const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECTID!;

// 2. Set chains
export const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

export const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo'
}

export const imtblzkEvmTestnet = {
  chainId: 13473,
  name: 'Immutable zkEVM Testnet',
  currency: 'tIMX',
  explorerUrl: 'https://explorer.testnet.immutable.com',
  rpcUrl: 'https://rpc.testnet.immutable.com'
}

export const imtblzkEvmMainnet = {
  chainId: 13371,
  name: 'Immutable zkEVM Mainnet',
  currency: 'IMX',
  explorerUrl: 'https://explorer.immutable.com',
  rpcUrl: 'https://rpc.immutable.com'
}

// 3. Create a metadata object
export const metadata = {
  name: 'Passport Example',
  description: 'Login and inspect Immutable Passport features',
  url: passportLogoutRedirectUri, // origin must match your domain & subdomain
  icons: []
}

// 4. Create Ethers config
export const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})
