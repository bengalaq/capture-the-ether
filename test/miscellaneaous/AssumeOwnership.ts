import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

let assumeOwnershipContract:Contract;
const ASSUME_CHALLENGE_ADDRESS: string = "0x157b00C4Aa3ac08d78e717cEED6dAc039F63dbC2"

beforeEach(async()=> {
  const assumeFactory = await ethers.getContractFactory("AssumeOwnershipChallenge");
  assumeOwnershipContract = assumeFactory.attach(ASSUME_CHALLENGE_ADDRESS);
})

describe("Assume Ownership", async()=>{
  it("Resuelve el Miscellaneous challenge - Assume Ownership", async()=>{
    const txConstructorConDefecto = await assumeOwnershipContract.AssumeOwmershipChallenge();
    await txConstructorConDefecto.wait();

    const txAuthenticate = await assumeOwnershipContract.authenticate();
    await txAuthenticate.wait();

    //Chequeo si isComplete es true
    let isComplete = await assumeOwnershipContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})