import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

let callMeContract: Contract;

beforeEach(async ()=>{
  const callMeFactory = await ethers.getContractFactory("CallMeChallenge");
  callMeContract = await callMeFactory.attach("0x72095e295D1A62ebE981ED047a43081a8F317edF");
});

describe("CallMe",async function () {
  it("Resuelve el challenge Warmup - CallMeChallenge", async function () {
    const tx = await callMeContract.callme(); //Por defecto ethers invoca la función desde la primer account en ethers.getSigners();
    const txHash = tx.hash;
    console.log(`El hash de la tx es: ${txHash}`);//Para revisar la transacción en caso que demore un poco.

    expect(txHash).to.not.be.undefined;
  });
});
