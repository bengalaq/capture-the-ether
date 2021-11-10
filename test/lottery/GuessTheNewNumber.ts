import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

let newNumberContract: Contract;
let attackerNewNumberContract: Contract;

beforeEach(async ()=>{
  const newNumberFactory = await ethers.getContractFactory("GuessTheNewNumberChallenge");
  newNumberContract = newNumberFactory.attach("0xDF44b94E500CC9cAba7BE9365794AF4320df0C7f");
  const attackerNewNumberFactory = await ethers.getContractFactory("TheNewNumberChallengeAttacker");
  attackerNewNumberContract = await attackerNewNumberFactory.deploy();
})

describe("Guess The New Number", async()=>{
  it("Resuelve el Lottery challenge - Guess The New Number", async()=>{
    const tx = await attackerNewNumberContract.atacarNewNumberChallenge(newNumberContract.address,{
      value: ethers.utils.parseEther("1"),
      gasLimit: 1e5
    });
    console.log(tx.hash)
    tx.wait();
    let isComplete:boolean = await newNumberContract.isComplete();
    if (isComplete) {
      console.log("DESAFÍO RESUELTO. Retirando ETH...");
    }

    expect(isComplete,"DESAFÍO INCOMPLETO").to.be.true;
  })
})