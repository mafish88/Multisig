import { TxSignBuilder, Data, applyParamsToScript, validatorToScriptHash, applyDoubleCborEncoding, Validator, Assets, UTxO, Datum, Redeemer , Delegation, LucidEvolution , validatorToAddress, validatorToRewardAddress, getAddressDetails} from "@lucid-evolution/lucid";
import { getNewLucidInstance, changeProvider } from "../../helpers/newLucidEvolution";
interface WalletSettings {
  network: string;
  // Add other necessary settings
}

interface Recipient {
  address: string;
  amount: Assets;
}

const rawScript = `5911ff0101003232323232323232322322533300432323232323232323232323232323232323232325333018300c301a375402026464646464a66603a60140022a66604260406ea8058540085854ccc074c0440044c94ccc088004584c94cccccc09c0045858584c94ccc090c09c00c5401458dd68008b181200098101baa01616301e375402a264a6660386012603c6ea80544cc01400405c4cc8c8c8c8c8c8c8c8c8c8c8c88c8c8c8c8c8c8c8c8c8c8c8c94ccc0d4cc08cc090c0e0dd50181bad302b3038375400e2a66606a0062a66606a004200229405280a505333034302830133300d005008153330343375e006008266606860426eb4c090c0dcdd5001a504a2294052819baf3029303637546464a66606a6044606e6ea80044c0ecc0e0dd50008b299981a18141809800899808000a40002c64660020026eb0c0a4c0dcdd501791299981c8008a5eb804c8c94ccc0dcccc0dccdd79816981d1baa00200e4a09444cc0f0008cc0100100044cc010010004c0f4008c0ec004c0a0c0d8dd500299baf374c6602666602a6eb0c0a0c0d4dd5016a5eb7bdb180894ccc0d0cdd79815181b9baa00b302a303737546054606e6ea8c090c0dcdd500109980a8009bab3024303737546048606e6ea80084004c8cc004004ccc058dd61814181b1baa02e4bd6f7b63011299981a99baf00c302b3038375400426602c0026eacc094c0e0dd5001080091299981c0008a5eb7bdb1804c8cc0e8cdd8181b8009ba632330010013756607200444a666076002297adef6c601323303d3376060740026ea0cdc0a40006eb4c0ec004cc00c00cc0fc008c0f4004cc00c00cc0f0008c0e8004dd31929998199810181a9baa0011333015488100488100375a6072606c6ea80044c8c8ccc05cdd7181d8011bae303b001375a607660780026076002606c6ea8004c034c0d4dd500218121981b1ba8337006eb4c09cc0d0dd50019bad3021303437540066606c604260686ea800ccc0d8c098c0d0dd50019981b1806181a1baa0034bd70192999818980f18199baa00113037303437540022c66018002010a66605e603860626ea80084c94ccc0c0c070c0c8dd5000899299999981c8008b0b0991981480091299981c0010801899299999981e800899980980089801181e0018b0b0b0b0b181d0011bac00116163036303337540022c604860646ea8c0d4c0c8dd50010b192999817980e18189baa00113035303237540022c6601400400c6603c6eb0c088c0c0dd50141180c9998101bab301e3031375400291011ca653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae00004533302c3019302e3754002264a66605a6032605e6ea80044c94cccccc0d800458584c8cc098004894ccc0d4008400c4c94cccccc0e80044ccc0400044c008c0e400c5858585858c0dc008dd60008b0b181998181baa001163021302f37546038605e6ea8c0c8c0bcdd50008b1980e1bac3021302e375404c4602e66603c6eacc070c0bcdd5180e18179baa00148811ca653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae00002337169001014192999815180b98161baa00113020302d37546034605a6ea8c0c0c0b4dd50008a99815a496e65787065637420536f6d6528696e70757429203d206c6973742e66696e64280a202020207472616e73616374696f6e2e696e707574732c0a20202020666e28696e70757429207b20696e7075742e6f75747075745f7265666572656e6365203d3d206f7574526566207d0a20202900163301a3758603e60586ea80908cdd7981018169baa0010113001001222533302d0011002133300300332323300100100422533303000114bd7009919299981719baf00200510011330330023300400400130340023032001302f00130300012302c302d302d302d0013001001222533302a00214c0103d87a800013232533302830150031301b3302d0024bd70099980280280099b8000348004c0b800cc0b00088894ccc094c048c09cdd5001899299981500080109929999998178008018018018991929998168008028992999999819000803003003099192999818000804099299999981a8008992999819000805099299999981b8008a999819981b0010a999817980e18189baa003132533303400100c1325333333039001132533303600100e132533333303b00115333037303a00213330170031323253330353022001132533303a001012132533333303f0011533303b303e0021323253330393026001132533303e00101613253333330430011533303f3042002133301f001150040170170170170170173040001303c37540062a666072605a002264a66607c00202c264a66666608600202e02e02e26464a666082002032264a66666608c00203403403426464a666088002038264a66666609200203a03a03a264a66608c60920062a01603c6eb4004074c118004c11800cdd680080d182180098218019bad0010173040001303c375400602a60746ea80085401004c04c04c04c04cc0f0004c0e0dd50018a99981a98148008a99981c981c1baa003150020110113036375400426464a66606a6044002264a666074002024264a66666607e002026026026264a666078607e0062a00a0286eb400404cc0f0004c0e0dd50038a99981a9814800899299981d000809099299999981f80080980980980989919299981e80080a899299999982100080b00b00b00b09919299982000080c099299999982280080c80c80c899299982118228018a80580d1bad00101930420013042003375c002607e002607e0066eb8004c0f0004c0e0dd5003808981b1baa0061501000f00f00f00f00f00f3038001303800200d00d00d00d30360013032375400601601601601601601660680026068004012012012012606400260640066eb4004018c0bc004c0bc00cdd6800801981600098141baa00300130010012253330260011480004cdc0240046600400460520024464666002002006004444a666050004200226466600800860580066644646600200200a44a66605a00226605c66ec0dd48021ba60034bd6f7b630099191919299981699b90008002133032337606ea4020dd30038028a99981699b8f008002132533302e301b3030375400226606666ec0dd4804981a18189baa001004100432533302e533303200114a229405300103d87a80001302133033374c00297ae0323330010010080022225333034002100113233300400430380033322323300100100522533303900113303a337606ea4010dd4001a5eb7bdb1804c8c8c8c94ccc0e4cdc800400109981f19bb037520106ea001c01454ccc0e4cdc7804001099299981d1813981e1baa00113303f337606ea4024c100c0f4dd5000802080219299981d18138008a60103d87a80001302d3303f375000297ae03370000e00226607c66ec0dd48011ba800133006006003375a60760066eb8c0e4008c0f4008c0ec004dd718198009bad30340013036002133032337606ea4008dd3000998030030019bab302f003375c605a0046062004605e0026eb8c09c004dd598140009815001111299981098070008a5eb7bdb1804c8c8cc0040052f5bded8c044a66605000226605266ec0dd48031ba60034bd6f7b630099191919299981419b9000a00213302d337606ea4028dd30038028a99981419b8f00a00213302d337606ea4028dd300380189981699bb037520046e98004cc01801800cdd598150019bae3028002302c002302a00132330010014bd6f7b63011299981380089981419bb037520086ea000d2f5bded8c0264646464a66604e66e400200084cc0b0cdd81ba9008375000e00a2a66604e66e3c0200084cc0b0cdd81ba9008375000e00626605866ec0dd48011ba800133006006003375a60520066eb8c09c008c0ac008c0a4004888c8ccc00400401000c8894ccc09c00840044ccc00c00cc0a8008cc010c0a4008004888c94ccc080c0340044c94ccc09400400c4c94cccccc0a80040100100100104c94ccc09cc0a800c54018014dd7000981380098119baa0041533302030140011325333025001003132533333302a0010040040040041325333027302a00315006005375c002604e00260466ea8010008c084dd50019bad3022301f375402a64a6660386012603c6ea80044c088c07cdd50008b199802a451ca653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae0033716900000c80b18101810801180f800980d9baa0101330013253330193006301b37540022603e60386ea800458ccc00922011ca653490ca18233f06e7f69f4048f31ade4e3885750beae0170d7c8ae0033716900000b1807180d9baa010300e301b37540204464660020020064464a666038601200226464660020026eb0c090c094c094c094c094c094c094c094c094c084dd50031129998118008a5013253330203371e6eb8c09800801052889980180180098130009bae3022301f37540042a66603860200022646464a66603e64660020026eb0c058c08cdd50041129998128008a50132533302233712900119980a1bab3012302537546024604a6ea8c0a000801401052889980180180098140008a511325333020300d3022375400226600e00e604c60466ea80045281998048010008039bae30243025002375c6046002603e6ea800854ccc070c0200044c8cdc49bad3023302400132330010013758604800444a6660460022900009991299981099804004001099b80001480084004c094004cc008008c098004c07cdd50010a99980e19b87480180044cc028c02cc07cdd50021bad3022301f37540042664464a66603e602660426ea80044c94ccc080c050c088dd5180818119baa301630233754008266e2000c0044cdc48018009bad3025302237540022940c050c084dd5180a18109baa002300b301f37540086eb4c088c07cdd5001180e9baa00122232533301a300e301c37540022980103d87a8000132533301b3007301d375400226464a66666604a004264666002002006260226604600697ae0222325333021300e0011325333026001006132533333302b0010070070070071325333028302b00315005008375c002605000260486ea800c54ccc084c0540044c94ccc0980040184c94cccccc0ac00401c01c01c01c4c8c94ccc0a40040244c94cccccc0b80040280280280284c94ccc0acc0b800c5402002cdd7000981580098158019bae0013028001302437540062a666042601a002264a66604c00200c264a66666605600200e00e26464a666052002012264a66666605c002014014014264a666056605c00626603c00844a66605a0042a014264a666666064002266601a01a00226004606200601c01c01c01c605e0040166eb4004028c0ac004c0ac00cdd6000803803981400098121baa003153330213370e900300089929998130008030992999999815800803803803899299981418158018a8028041bad0010073028001302437540062a66604266e1d20080011325333026001006132533333302b0010070070071325333028302b00315005008375a00200e605000260486ea800c014c088dd50010008008008008a60103d87a80003021301e37540022980103d87a8000300f301d37546014603a6ea8c080c074dd5000998051bac3009301c37540024600a6660186eacc028c074dd51805180e9baa001004003371090001b8748010dc3a40004464a66602a6012602e6ea80044c94ccc058c028c060dd51803180c9baa300630193754008266e2000400c4cdc48008019bad301b301837540022940c028c05cdd51802180b9baa00223018301930193019301930193019301900123017301800122323300100100322533301700114c0103d87a80001323253330153005002130083301a0024bd70099802002000980d801180c8009111929998091803180a1baa0011480004dd6980c180a9baa0013253330123006301437540022980103d87a80001323300100137566032602c6ea8008894ccc060004530103d87a80001323232325333018337220100042a66603066e3c0200084c02ccc074dd4000a5eb80530103d87a8000133006006003375a60340066eb8c060008c070008c068004c8cc004004010894ccc05c0045300103d87a80001323232325333017337220100042a66602e66e3c0200084c028cc070dd3000a5eb80530103d87a8000133006006003375660320066eb8c05c008c06c008c064004dd2a40006e1d200223012301330130012301100122323300100100322330030013002002300e300f002300d001300d002300b001300737540022930a99802a491856616c696461746f722072657475726e65642066616c73650013656375c002ae695ce2ab9d5573caae7d5d02ba15744ae901`

class SmartWallet {
  private lucid!: LucidEvolution ;
  private script: Validator ;
  private utxos: UTxO[] = [];
  private delegation: Delegation = { poolId: null, rewards: BigInt(0) };
  private pendingTxs: { tx: any; signatures: Record<string, string> }[] = [];
  private addressNames: Record<string, string> = {};
  private defaultAddress: string = "";
  private id: string;

  constructor(id: string) {
    this.id = id;
    console.log("id", id, rawScript)
    this.script = {
      type: "PlutusV3",
      script: applyParamsToScript(applyDoubleCborEncoding(rawScript), [id])
    };


    
  }


  async initializeLucid(settings: WalletSettings): Promise<void> {
    try {
      this.lucid = await getNewLucidInstance(settings);
      this.lucid.selectWallet.fromAddress( this.getAddress(), this.utxos);
      await this.loadUtxos();
    } catch (e) {
      console.error(e);
      throw new Error("Error creating new Lucid Instance: " + e);
    }
  }
  


  async changeSettings(settings: WalletSettings): Promise<void> {
    if (settings.network !== this.lucid.config().network) {
      this.utxos = [];
      this.delegation = { poolId: null, rewards: BigInt(0) };
    }

    try {
      await changeProvider(this.lucid, settings);
      await this.loadUtxos();
    } catch (e) {
      throw new Error('Invalid Connection Settings: ' + e);
    }
  }

  getName(): string {
    return "Todo"
  }

  getPendingTxs(): { tx: any; signatures: Record<string, string> }[] {
    return this.pendingTxs;
  }


  getAddress(): string {
    const stakeCredential = { type : `Script` as any , hash : validatorToScriptHash(this.script) }

    return validatorToAddress(this.lucid.config().network, this.script, stakeCredential);
  }

  getEnterpriseAddress(): string {
    return validatorToAddress(this.lucid.config().network, this.script);
  }



  async getDelegation(): Promise<Delegation> {
    const rewardAddress = validatorToAddress(this.lucid.config().network, this.script);

    this.delegation = await this.lucid.config().provider.getDelegation(rewardAddress);
    return this.delegation;
  }

  getFundedAddress() : string[] {
    const utxos = this.utxos
    let result : string[] = []
    utxos.map( utxo => {
      result.push(utxo.address);
        
       }
      )
      
    return  [...new Set(result)]; 
  }

  getBalance(address: string = ""): number {
    let result = BigInt(0);
    this.utxos.forEach(utxo => {
      if (address === "" || utxo.address === address) {
        result += BigInt(utxo.assets.lovelace);
      }
    });
    return Number(result + BigInt(this.delegation.rewards || 0));
  }

  getBalanceFull(address: string = ""): Assets {
    const result: Assets = {};
    this.utxos.forEach(utxo => {
      if (address === "" || utxo.address === address) {
        Object.entries(utxo.assets).forEach(([asset, amount  ]) => {
          result[asset] = (result[asset] || BigInt(0)) + BigInt(amount);
        });
      }
    });
    if (result["lovelace"]) {
      result["lovelace"] += BigInt(this.delegation.rewards || 0);
    }
    return result;
  }

  async loadUtxos(): Promise<void> {
    try {
      const utxos = await this.lucid.utxosAt(this.getAddress());
      if (this.compareUtxos(utxos, this.utxos)) return;
      this.utxos = utxos;
      await this.getDelegation();
    } catch (e) {
      console.error("Error loading UTXOs:", e);
    }
  }


  private compareUtxos(a: UTxO[], b: UTxO[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((utxo, index) => 
      utxo.txHash === b[index].txHash && utxo.outputIndex === b[index].outputIndex
    );
  }
  
  async createTx(
    recipients: Recipient[],
    datums: Datum[],
    redeemer: Redeemer,
    sendAll: number | null = null,
    withdraw: boolean = true
  ): Promise<TxSignBuilder> {
    const tx = this.lucid.newTx();

    recipients.forEach((recipient, index) => {
      if (sendAll !== index) {
        tx.pay.ToAddress(recipient.address, recipient.amount);
      }
    });

    if (withdraw && this.delegation.rewards && BigInt(this.delegation.rewards) > 0) {
      tx.withdraw(validatorToRewardAddress( this.lucid.config().network, this.script), BigInt(this.delegation.rewards));
    }

    tx.attach.SpendingValidator(this.script)
      .collectFrom(this.utxos, redeemer);

    const returnAddress = sendAll !== null ? recipients[sendAll].address : this.getAddress();

    const completedTx = await tx.complete({ changeAddress: returnAddress });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  async createStakeUnregistrationTx(): Promise<TxSignBuilder> {
    const rewardAddress = validatorToRewardAddress(this.lucid.config().network, this.script);
    const tx = this.lucid.newTx()
      .deRegisterStake(rewardAddress)
      .attach.SpendingValidator(this.script)
      .collectFrom(this.utxos, Data.void());
      
    if (this.delegation.rewards && BigInt(this.delegation.rewards) > 0) {
      tx.withdraw(rewardAddress, BigInt(this.delegation.rewards));
    }

    const completedTx = await tx.complete({ changeAddress: this.getAddress()  });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  async createDelegationTx(pool: string): Promise<TxSignBuilder> {
    const rewardAddress = validatorToRewardAddress( this.lucid.config().network, this.script);
    const tx = this.lucid.newTx()
      .delegateTo(rewardAddress, pool)
      .attach.CertificateValidator(this.script)
      .collectFrom(this.utxos, Data.void());

    if (this.delegation.poolId === null) {
      tx.registerStake(rewardAddress);
    }

    const completedTx = await tx.complete({ changeAddress:  this.getAddress() });
    this.pendingTxs.push({ tx: completedTx, signatures: {} });
    return completedTx;
  }

  isAddressMine(address: string): boolean {
    return getAddressDetails(address).paymentCredential?.hash ===
           getAddressDetails(this.getAddress()).paymentCredential?.hash;
  }

  isAddressValid(address: string): boolean {
    try {
      return !! getAddressDetails(address);
    } catch (e) {
      return false;
    }
  }

  isAddressScript(address: string): boolean {
    return getAddressDetails(address).paymentCredential?.type === "Script";
  }

  async submitTransaction(index: number): Promise<Boolean> {
    try {
      const tx = this.pendingTxs[index];
      const signedTx = await tx.tx.assemble(Object.values(tx.signatures)).complete();
      const txHash = await signedTx.submit();
      return this.lucid.awaitTx(txHash, 2500);
    } catch (e : any) {
      console.error(e);
      const errorMessage = e.message ? e.message : JSON.stringify(e);
      throw new Error(errorMessage);
    }
  }

  getId(): string {
    return this.id;
  }

  setDefaultAddress(address: string): void {
    this.defaultAddress = address;
  }

  setAddressNames(names: Record<string, string>): void {
    this.addressNames = names;
  }

  changeAddressName(address: string, name: string): void {
    this.addressNames[address] = name;
  }

  getDefaultAddress(): string {
    return this.defaultAddress || this.getAddress();
  }

  getAddressNames(): Record<string, string> {
    return this.addressNames;
  }

  getAddressName(address: string): string {
    return this.addressNames[address] || (address === this.getAddress() ? "Regular Address" : address);
  }
}

export default SmartWallet;