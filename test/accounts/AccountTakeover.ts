import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let ACCOUNT_TAKEOVER_CHALLENGE_ADDRESS: string = "0x42637FC3f5f0e636e672eAeE3E394DAB3D98B25e";
let accountTakeoverChallengeContract: Contract;
let accounts: Signer[];
let eoa: Signer;
const OWNER_DEL_CHALLENGE = "0x6B477781b0e68031109f21887e6B5afEAaEB002b";
const PRIVATE_KEY_FROM_SCRIPT_PYTHON = "614f5e36cd55ddab0947d1723693fef5456e5bee24738ba90bd33c0c6e68e269";



beforeEach(async () => {
  [eoa] = await ethers.getSigners();

  const accountFactory = await ethers.getContractFactory("AccountTakeoverChallenge");
  accountTakeoverChallengeContract = accountFactory.attach(ACCOUNT_TAKEOVER_CHALLENGE_ADDRESS);
})

describe("Account Takeover", async () => {
  it("Resuelve el Accounts challenge - Account Takeover", async () => {
    const nuevaWallet = new ethers.Wallet(PRIVATE_KEY_FROM_SCRIPT_PYTHON, eoa.provider);

    expect(nuevaWallet.address, "LA ADDRESS DERIVADA DE LA PK NO COINCIDE CON OWNER!!").to.equal(OWNER_DEL_CHALLENGE);
    //Acordarse de enviar un poco de eth a la nueva wallet, ya que si no no tendrá eth para pagar el gas de la llamada a authenticate.
    const txEnvioDeEthParaGas = await eoa.sendTransaction({
      to: nuevaWallet.address,
      value: ethers.utils.parseEther("0.1")
    });

    await txEnvioDeEthParaGas.wait();

    const instanciaContratoConNuevaWallet = accountTakeoverChallengeContract.connect(nuevaWallet);

    const txAuthenticate = await instanciaContratoConNuevaWallet.authenticate();
    await txAuthenticate.wait();

    //Chequeo si isComplete es true
    let isComplete = await accountTakeoverChallengeContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})