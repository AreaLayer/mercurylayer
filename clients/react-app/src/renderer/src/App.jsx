

import { useDispatch, useSelector } from 'react-redux'
import { walletActions } from './store/wallet'

import CreateWallet from './components/CreateWallet'
import WalletList from './components/WalletList'
import { useEffect, useState, useRef } from 'react'

import init from 'mercury-wasm';
import wasmUrl from 'mercury-wasm/mercury_wasm_bg.wasm?url'

import coinStatus from './logic/coinStatus';

import transferReceive from './logic/transferReceive'

function App() {
  const dispatch = useDispatch();

  const [areWalletsLoaded, setAreWalletLoaded] = useState(false)

  const wallets = useSelector(state => state.wallet.wallets);

  const backupTxs = useSelector(state => state.wallet.backupTxs);

  const walletsRef = useRef(wallets);

  useEffect(() => {
    // Update the ref to the current wallets on each render
    walletsRef.current = wallets;
  });

  useEffect(() => {

    const loadWasm = async () => {
      await init(wasmUrl);
    };

    async function fetchWallets() {
      const wallets = await window.api.getWallets();

      await dispatch(walletActions.loadWallets(wallets));
      
      const backupTxs = await window.api.getAllBackupTxs();

      await dispatch(walletActions.loadBackupTxs(backupTxs));

      setAreWalletLoaded(true);
    }

    loadWasm();
    fetchWallets();

  }, []);

  useEffect(() => {
    if (wallets && wallets.length > 0 && areWalletsLoaded) {
      window.api.syncWallets(wallets);
    }

    const executeFunction = async () => {
      // Here, wallets will always reflect the latest state
      console.log(wallets);
      let coinsUpdated = await transferReceive.execute(wallets);
      // console.log("coinsUpdated", coinsUpdated);
      await dispatch(walletActions.transferReceive({coinsUpdated}));

      let updatedStatus = await coinStatus.updateCoins(wallets);

      await dispatch(walletActions.coinStatus(updatedStatus));
    };

    // Set up the interval
    const interval = setInterval(() => {
      executeFunction();
    }, 5000);

    // Clean up the interval on component unmount or wallets change
    return () => clearInterval(interval);
  }, [wallets]);

  useEffect(() => {
    if (backupTxs && backupTxs.length > 0 && areWalletsLoaded) {
      window.api.syncBackupTxs(backupTxs);
    }
  }, [backupTxs]);

  return (
    <div className="container">

      <CreateWallet />
      <WalletList style={{marginTop: 10}} />

    </div>
  )
}

export default App
