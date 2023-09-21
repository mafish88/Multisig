
import Wallet from '../../Wallet';
import MWalletList from "./WalletList";
import MWalletMain from './WalletMain'; 
import WalletConnector from './walletConnector';
import connectSocket from  '../../helpers/SyncService';
import sha256 from 'crypto-js/sha256';
import  { ReactComponent as LoadingIcon } from '../../html/assets/loading.svg';
import React from 'react';
import { toast } from 'react-toastify';
import "./MultisigContainer.css"
import ModalsContainer from './ModalsContainer';



class MultisigContainer extends React.Component {
state= {
    modal: "",
    wallets: [],
    pendingWallets: {},
    selectedWallet: 0,
    connectedWallet: {name: "", socket: null},
    loading : true,
}

componentDidUpdate(prevProps) {

  if (this.props.settings !== prevProps.settings) {
    this.newSettings(this.props.root.state.settings)
    console.log("settings changed")
    
    
  }
}

async newSettings(newSettings){
  const wallets=[...this.state.wallets]
  for(let index = 0 ; index < this.state.wallets.length ; index++){
    try{
     await wallets[index].changeSettings(newSettings)
    }catch(e){
      console.log(e)
    }
  }
  this.reloadBalance()

}


async showModal(modalName){
    this.setState({modal: modalName})
  }

async setState(state){
    await super.setState(state)
    this.storeState()
    this.storeWallets()
  }

  componentDidMount() {
    this.loadState()
    this.interval = setInterval(() => {
        this.reloadBalance()
    }, 15000);
  }

  

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  

  async connectWallet(wallet){
    try{

        if (this.state.connectedWallet) {
            const connectedWallet = this.state.connectedWallet
  
            if (connectedWallet.socket) {
                connectedWallet.socket.close()
            }
        }

      const socket =  await connectSocket(wallet, this) 
      let connectedWallet = {  name :wallet , socket: socket}
      this.setState({connectedWallet})
    }
    catch(e){
      console.log(e.message)
      toast.error("Could not connect to sync service");
    }
  }

  disconnectWallet(error=""){
    if (error !== ""){
      toast.error(error);
    }
    if (this.state.connectedWallet.socket) {
      this.state.connectedWallet.socket.close()
    }
    let connectedWallet = {name: "", socket: null}

    this.setState({connectedWallet})
  }
  
  async reloadAllBalance(){
    try {
      if (this.state.wallets.length > 0){
        const wallets = this.state.wallets
        for(let index = 0 ; index < this.state.wallets.length ; index++){
          await wallets[index].loadUtxos()
        }
        this.setState({wallets})
      }
    }
    catch(e) {
      toast.error(e.message);
    } 
  }

  async reloadBalance(){
      try {
        if (this.state.wallets.length > 0){
          const wallets = this.state.wallets
          await wallets[this.state.selectedWallet].loadUtxos()
          this.setState({wallets})
        }
      }
      catch(e) {
        toast.error(e.message);
      }
    
  }

  storeState(){

    localStorage.setItem("connectedWallet", JSON.stringify(this.state.connectedWallet.name ))
    localStorage.setItem("pendingWallets", JSON.stringify(this.state.pendingWallets))
    localStorage.setItem("acceptedTerms", this.state.acceptedTerms)

  }

  storeWallets()  {
    if (this.state.loading) return

     const dataPack = this.state.wallets.map( (wallet,index)=> ({json: wallet.getJson(),
                                                                name :wallet.getName(),
                                                               defaultAddress: wallet.getDefaultAddress(),
                                                               addressNames: wallet.getAddressNames(),
                                                               pendingTxs: wallet.getPendingTxs().map( tx => ( {tx: tx.tx.toString(), signatures: tx.signatures } ) ) 
                                                              }) )
    localStorage.setItem("wallets", JSON.stringify(dataPack))
  }

  async loadState(){
    const wallets = JSON.parse(localStorage.getItem('wallets'));
    let state = this.state
    state.pendingWallets = JSON.parse(localStorage.getItem('pendingWallets'))
    state.acceptedTerms = localStorage.getItem('acceptedTerms')
    super.setState(state) 

    if (wallets) for(let index = 0 ; index < wallets.length ; index++){
      
    
      const myWallet = wallets[index].json.type === "tokenVault" ? new TokenWallet(wallets[index].json.token,wallets[index].name) : new Wallet(wallets[index].json,wallets[index].name);
      await myWallet.initialize(localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : this.props.root.state.settings  );
      myWallet.setDefaultAddress(wallets[index].defaultAddress)
      myWallet.setAddressNamess(wallets[index].addressNames)
      myWallet.setPendingTxs(wallets[index].pendingTxs)
      await myWallet.checkTransactions()
      state.wallets.push(myWallet)
    }
    if (localStorage.getItem('connectedWallet') && JSON.parse(localStorage.getItem('connectedWallet')) !== ""){
      this.connectWallet(JSON.parse(localStorage.getItem('connectedWallet')))
    }
    super.setState(state) 
    this.setState({loading : false})
  }
 

  async createTx(recipients,signers,sendFrom, sendAll=null){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createTx(recipients,signers,sendFrom,sendAll)
    
    this.setState({wallets})
    toast.info('Transaction created');
    }catch(e){
      if (e ==="InputsExhaustedError")
        toast.error("Insuficient Funds");
      else
        {
          toast.error(e.message);
          toast.error(e);
        }

    }
  }

  async importTransaction(transaction){
    try{
    const wallets = this.state.wallets
    await this.state.wallets[this.state.selectedWallet].importTransaction(transaction)
    this.setState({wallets})
    toast.success("Transaction imported");
    }catch(e){
      toast.error("Could not import transaction: " + e.message);
    }
  }

  async createDelegationTx(pool,signers){
    try{
    const wallets = this.state.wallets
     await this.state.wallets[this.state.selectedWallet].createDelegationTx(pool,signers)
    this.setState({wallets})
    toast.info('Delegation Transaction created');
    }catch(e){
      toast.error(e.message);
    }
    
  }

  async createStakeUnregistrationTx(signers){
    try{
    const wallets = this.state.wallets
      await this.state.wallets[this.state.selectedWallet].createStakeUnregistrationTx(signers)
    this.setState({wallets})
    toast.info('Stake Unregistration Transaction created');
    }catch(e){
      toast.error(e.message);
    }
  }

  async deleteWallet(index){
    const wallets = this.state.wallets
    const confirmation =  window.confirm("Are you sure you want to delete this wallet?");
    if (confirmation === false){
      return
    }
    if (index === this.state.selectedWallet){
      this.setState({selectedWallet: 0})
    }
    wallets.splice(index,1)
    this.setState({wallets})
  }

  async removePendingTx(index){
    const wallets = this.state.wallets
    await wallets[this.state.selectedWallet].removePendingTx(index)
    this.setState({wallets})
  }

  changeWalletName(name){
    const wallets = this.state.wallets
    wallets[this.state.selectedWallet].setName(name)
    this.setState({wallets})
  }


  addSignature(signature){ 
    try {
    const wallets = this.state.wallets
    const transaction = wallets[this.state.selectedWallet].addSignature(signature)

    this.transmitTransaction(transaction, signature)
    this.setState({wallets})
    toast.info('Signature Added');
    }
    catch(e) {
      toast.error(e.message);
    }
  }

  setDefaultAddress(address){
    try {
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].setDefaultAddress(address)
      this.setState({wallets})
      toast.info('Default Account Changed');
      }
      catch(e) {
        toast.error(e.message);
      }
  }



  changeAddressName(address,name){
    try {
      
      const wallets = this.state.wallets
      wallets[this.state.selectedWallet].changeAddressName(address,name)
      this.setState({wallets})
      }
      catch(e) {
        toast.error(e.message);
      }
  }

  getTransactionHistory(address){

    const wallets = this.state.wallets
    const resault = wallets[this.state.selectedWallet].getTransactionHistory(address)
    this.setState({wallets})
    toast.promise(
      resault,
      {
        pending: 'Getting Transaction History',
        error: 'Failed Retriving Transaction History'
      }
  )
    return resault
  }

  deleteImportedWallet(key){
    const pendingWallets = this.state.pendingWallets
    delete pendingWallets[key]
    this.setState({pendingWallets})
  }

  deleteAllPendingWallets(){
    const pendingWallets = this.state.pendingWallets
    for (var key in pendingWallets) {
      delete pendingWallets[key]
    }
    this.setState({pendingWallets})
  }

  async importPendingWallet(key){
    try{
      const pendingWallets = this.state.pendingWallets
      const wallets = this.state.wallets
      const pendingWallet = pendingWallets[key]
      const walletHash = await this.walletHash(pendingWallet.json)
      const walletsHashes = wallets.map(wallet =>  this.walletHash(wallet.getJson()))
      // resole promices in walletHashes
      const res = await Promise.all(walletsHashes)
      if (! res.includes(walletHash)) {
        const myWallet = new Wallet(pendingWallet.json,"Imported Wallet");
        await myWallet.initialize(this.props.root.settings);
        wallets.push(myWallet)
        this.setState({wallets})
        //remove pending wallet
        delete pendingWallets[key]
        
        this.setState({pendingWallets})
        if (this.state.connectedWallet.socket) {
          this.state.connectedWallet.socket.emit('subscribe' , pendingWallet.script)}
            
        toast.success("Wallet Imported");
      }else{
        toast.error("Wallet already exists")
      }
      }catch(e){
        toast.error(e.message);
      }
  }



  async addWallet(script,name){
    const wallets = this.state.wallets
    const walletsHashes = wallets.map(wallet =>  this.walletHash(wallet.getJson()))
    console.log(script)
    const res = await Promise.all(walletsHashes)
    const myWallet = new Wallet(script,name);
    await myWallet.initialize(this.props.root.state.settings);
    const walletHash = await this.walletHash(myWallet.getJson())

    if (this.state.connectedWallet.socket) {
       this.state.connectedWallet.socket.emit('subscribe' , script)}
    if (! res.includes(walletHash)) {
      
      this.transmitWallet(script)
      wallets.push(myWallet)
      this.setState(wallets)
    }else{
      
      toast.error("Wallet already exists")
    }
  }

  loadWallets(){
    if(this.state.connectedWallet.socket) {
    this.state.connectedWallet.socket.emit('loadWallets')
    }else{
      toast.error("Not Connected to a SyncService")
    }
  }

  transmitTransaction(transaction, sigAdded) {
    if(this.props.root.state.settings.disableSync) return
    fetch(this.props.root.state.syncService+'/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({tx: transaction.tx.toString() ,sigAdded: sigAdded ,  signatures: transaction.signatures , wallet:  this.state.wallets[this.state.selectedWallet].getJson()}),
      })
  }


  transmitWallet(script) {
    if(this.props.root.state.settings.disableSync) return
    fetch(this.props.root.state.syncService+'/api/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(script),
      })
  }

  async loadTransaction(transaction, walletIndex){
    const wallets = this.state.wallets
    await wallets[walletIndex].loadTransaction(transaction)
    this.setState({wallets})
  }

  selectWallet(key){
    const selectedWallet = key
    this.setState( { selectedWallet})
    this.reloadBalance()
  }

  walletHash(wallet) {
    //remove the name field from the wallet object recursively
    function removeName(obj) {
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach((item) => {
            removeName(item);
          });
        } else {
          delete obj.name;
          Object.keys(obj).forEach((key) => {
            removeName(obj[key]);
          });
        }
      }
    }
    ;
    // create a deep copy of the wallet object
  
    const cleanWallet = JSON.parse(JSON.stringify(wallet));
    removeName(cleanWallet)
    
  //crypto.createHash('sha256').update(JSON.stringify(cleanWallet)).digest('hex'); for react
    return getSHA256Hash(cleanWallet)

    async function getSHA256Hash(jsonObj) {
      const jsonString = JSON.stringify(jsonObj);
      const hashHex = sha256(jsonString).toString();
      return hashHex;
    }
    
    
  }


  async submit(index){
   
    const wallets = this.state.wallets
    const promice = wallets[this.state.selectedWallet].submitTransaction(index)
    this.setState({wallets})
    toast.promise(
      promice,
      {
        pending: 'Submiting Transaction',
        success: 'Transaction Submited'
      }
      )
      promice.then( 
        //add a small delay to allow the transaction to be broadcasted
        () => setTimeout(() => this.reloadBalance(), 5000)
      ).catch(
        (e) => toast.error("Transaction Failed:" + JSON.stringify(e.message))
      )
    
  }

   walletsEmpty = () => {
    return (
      <div className="walletsEmpty">
        <h2>No Wallets Found</h2>
        <p>Create a new wallet to start using this APP.</p>
        <button onClick={() => this.setState({modal: "newWallet"})}>Add Wallet</button>
      </div>
    )
  }


  render() {  
  return(
    <div className="MultisigContainer">
        <React.StrictMode>
        <ModalsContainer moduleRoot={this} root={this.props.root} modal={this.state.modal} ></ModalsContainer>

        <WalletConnector  moduleRoot={this} root={this.props.root}  key={this.state.connectedWallet}></WalletConnector>

         {this.state.loading ? <LoadingIcon className="loadingIcon"> </LoadingIcon> :
        <div className='WalletInner'>
            <MWalletList root={this.props.root} moduleRoot={this}  ></MWalletList>
          { this.state.wallets.length === 0 ?  this.walletsEmpty()  : <MWalletMain root={this.props.root} moduleRoot={this}  wallet={this.state.wallets[this.state.selectedWallet]}></MWalletMain> }
        </div>
    }
        </React.StrictMode>
    </div>
  )  
}
}

export default MultisigContainer