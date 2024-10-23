import { passport } from '@imtbl/sdk'
import { useState } from 'react'
import { UserProfile } from '@imtbl/sdk/passport';
import { PassportButton } from './components/PassportButton';
import './App.css'
import { ExternalWallets } from './components/ExternalWallets';
import { passportDashboardUrl } from './utils/config';

import WebApp from '@twa-dev/sdk'
WebApp.ready();

function App({passportInstance}: {passportInstance: passport.Passport}) {
  const [userInfo, setUserInfo] = useState<UserProfile>();
  const [walletAddress, setWalletAddress] = useState<string>();

  async function login(){
    // Use loginWithDeviceFlow as the login method for Telegram Mini App to ensure support for all devices
    const deviceFlowParams = await passportInstance.loginWithDeviceFlow();
    // Open the device flow url using the openLink function on the telegram sdk
    WebApp.openLink(deviceFlowParams.url);
    // Wait for the user to complete the login before calling eth_requestAccounts
    await passportInstance.loginWithDeviceFlowCallback(
        deviceFlowParams.deviceCode,
        deviceFlowParams.interval,
    );
    // Get the provider and call eth_requestAccounts to get the user's wallet address
    const provider = passportInstance.connectEvm();
    const [userAddress] = await provider.request({
        method: "eth_requestAccounts",
    });
    setWalletAddress(userAddress);

    try{
      const userProfile = await passportInstance.getUserInfo();
      setUserInfo(userProfile)
    } catch(err) {
      console.log("Failed to fetch user info");
      console.error(err);
    }
  }

  async function idTokenClick() {
    const idToken = await passportInstance.getIdToken();
    WebApp.openLink(`https://jwt.io?token=${idToken}`);
    // WebApp.showPopup
    // window.open(`https://jwt.io?token=${idToken}`, "_blank")
  }

  async function accessTokenClick() {
    const accessToken = await passportInstance.getAccessToken();
    WebApp.openLink(`https://jwt.io?token=${accessToken}`)
    // window.open(`https://jwt.io?token=${accessToken}`, "_blank")
  }

  function logout(){
    passportInstance.logout();
  }

  return (
    <div id="app">
      {!userInfo && <PassportButton title="Sign in with Immutable" onClick={login} />}
      {userInfo && (
        <>
        <div className='user-info'>
          <div className='user-info-row'>
            <p><strong>Passport info</strong></p>
            <a href={passportDashboardUrl} target='_blank'>Passport Dashboard</a>
            <PassportButton title="Logout" onClick={logout} />
          </div>
          <div className='user-info-row'><strong>Id:</strong><p>{userInfo.sub}</p></div>
          <div className='user-info-row'><strong>Email:</strong><p>{userInfo.email}</p></div>
          {walletAddress && <div className='user-info-row'><strong>Wallet:</strong><p>{walletAddress}</p></div>}
          <div className='user-info-row space'><button onClick={idTokenClick}>Inspect Id Token</button><button onClick={accessTokenClick}>Inspect Access Token</button></div>
          {/* <hr className='divider' />
          <ExternalWallets /> */}
        </div>
        <div className='docs-link-container'>
          <a href='https://docs.immutable.com/docs/zkEVM/products/passport' target='_blank'>Immutable zkEVM Docs</a>
          <a href='https://docs.immutable.com/docs/x/passport' target='_blank'>Immutable X Docs</a>
        </div>
        
        </>
      )}
    </div>
  )
}

export default App
