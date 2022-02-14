//Por qué existe el 0xff en CREATE2: https://eips.ethereum.org/EIPS/eip-1014
//Ver imágen "CREATE 2 explicación 0xff.png"

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

const FUZZY_CHALLENGE_ADDRESS= "0xa9371616488eD006dfd48838360d32872BBA6F34";
let addressDeSmarxContract: string = "0xF5832917475601993261c2644Cbadc0Deff1c4B9";
let smarxContract: Contract;
let fuzzyChallengeContract: Contract;

beforeEach(async () => {
  const smarxFactory = await ethers.getContractFactory("SmarxContract");
  smarxContract = smarxFactory.attach(addressDeSmarxContract);

  const fuzzyChallengeFactory = await ethers.getContractFactory("FuzzyIdentityChallenge");
  fuzzyChallengeContract = fuzzyChallengeFactory.attach(FUZZY_CHALLENGE_ADDRESS);
})

describe("Fuzzy Identity", async () => {
  it("Resuelve el Accounts challenge - Fuzzy Identity", async () => {
    //Preparación para interactuar con el contrato deployado en la address con "badc0de"
    const txAtacarAuthenticate = await smarxContract.atacarAuthenticate();
    await txAtacarAuthenticate.wait();

    //Chequeo si isComplete es true
    let isComplete = await fuzzyChallengeContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
  })
})