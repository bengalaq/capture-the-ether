import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

let nicknameContract: Contract;

beforeEach(async ()=>{
  const nicknameFactory = await ethers.getContractFactory("CaptureTheEther");
  nicknameContract = await nicknameFactory.attach("0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
})

describe("Nickname", async ()=>{
  it("Resuelve el challenge Warmup - NicknameChallenge", async ()=>{
    const tx = await nicknameContract.setNickname(ethers.utils.formatBytes32String("bengal4")); //Por defecto ethers invoca la función desde la primer account en ethers.getSigners();
    const txHash = tx.hash;
    console.log(`El hash de la transacción es ${txHash}`); //Para revisar la transacción en caso que demore un poco.

    expect(txHash).to.not.be.undefined;
  })
})
