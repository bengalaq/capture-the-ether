import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

let lotteryContract: Contract;

beforeEach(async () => {
  const lotteryFactory = await ethers.getContractFactory(
    "GuessTheNumberChallenge"
  );
  lotteryContract = lotteryFactory.attach(
    "0x42A1e9608e6b4c079E52323FB2d8b7009024f5Be"
  );
});

describe("Guess The Number", async () => {
  it("Resuelve el Lottery challenge - Guess The Number", async () => {
    const tx = await lotteryContract.guess(42, {
      value: ethers.utils.parseEther("1"),
      gasLimit: 1e5,
    });
    const txHash = await tx.hash;
    console.log(`El Hash de la transacción es ${txHash}`);

    expect(txHash).not.to.be.undefined;
  });
});
