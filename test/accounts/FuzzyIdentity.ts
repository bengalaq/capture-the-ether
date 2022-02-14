//Por qué existe el 0xff en CREATE2: https://eips.ethereum.org/EIPS/eip-1014
//Ver imágen "CREATE 2 explicación 0xff.png"

import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

const DEPLOYER_ADDRESS = "0x3e33bdF183a3f6c7F3d2C96162838fC3FF03018a";
const FUZZY_CHALLENGE_ADDRESS= "0xa9371616488eD006dfd48838360d32872BBA6F34";
let deployerContract: Contract;
let smarxContract: Contract;
let fuzzyChallengeContract: Contract;
let accounts: Signer[];
let incluyebadc0de: boolean = false;
let saltParaCreate2: string;
let addressDeSmarxContract: string;


beforeEach(async () => {
  const deployerFactory = await ethers.getContractFactory("Deployer");
  deployerContract = deployerFactory.attach(DEPLOYER_ADDRESS);

  const fuzzyChallengeFactory = await ethers.getContractFactory("FuzzyIdentityChallenge");
  fuzzyChallengeContract = fuzzyChallengeFactory.attach(FUZZY_CHALLENGE_ADDRESS);

})

describe("Fuzzy Identity", async () => {
  it("Resuelve el Accounts challenge - Fuzzy Identity", async () => {

    //Tenemos el address del contrato que deployará SmarxContract y el bytecode de SmarxContract. Solo nos falta averiguar el salt. Recordemos que la fórmula para calcular el address donde se deployará es igual a "keccak256(0xff ++ deployingAddr ++ salt ++ keccak256(bytecode))[12:]" donde [12:] significa que no toma en cuenta los primeros 12 bytes (se queda con 20).

    //0xff + deployingAddr
    let parte1Keccak = "0xff" + "3e33bdF183a3f6c7F3d2C96162838fC3FF03018a";

    // keccak256(bytecode)
    let parte2Keccak = "d5b7f8279e8b0ab473fe3c52cd801ff264d01f4e70665e0ca3583d91901ac0e7";
    // let parte2Keccak = ethers.utils.keccak256("0x6060604052341561000f57600080fd5b6101748061001e6000396000f30060606040526004361061004c576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100515780636c42640b14610082575b600080fd5b341561005c57600080fd5b610064610097565b60405180826000191660001916815260200191505060405180910390f35b341561008d57600080fd5b6100956100bf565b005b60007f736d617278000000000000000000000000000000000000000000000000000000905090565b73a9371616488ed006dfd48838360d32872bba6f3473ffffffffffffffffffffffffffffffffffffffff1663380c7a676040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401600060405180830381600087803b151561013657600080fd5b5af1151561014357600080fd5b5050505600a165627a7a72305820f8d0efdd4a19bb1f1dd4010f15174d5232f8ab30bba752b73d9030e45241f3380029").slice(2,66);

    console.log("COMIENZA BÚSQUEDA DE SALT...");
    
    for (let salt = 0; salt < 99999999999999999999; salt++) {
      // Convertimos el salt de tipo number a hexa, y luego a bytes32 agregando ceros hasta tener 32 de longitud.
      let saltEnBytes32 = ethers.utils.hexZeroPad(ethers.utils.hexValue(salt), 32);
      console.log(`SALT: ${saltEnBytes32}`);
      
      //Hacemos el concat, pero quitamos el 0x al saltEnBytes32.
      let unionDePartes = parte1Keccak.concat(saltEnBytes32.slice(2, 66)).concat(parte2Keccak);

      //Realizamos el keccak256 que utiliza create2 para calcular el address. Recordemos que quitar los primeros 12 bytes significa solo contemplar los últimos 20 bytes del hash. Como estamos en un sistema hexadecimal (base 16), diremos que 64 caracteres hexa / 32 bytes = 2 . Esto nos indica que, para retirar los primeros 12 bytes, debemos retirar los primeros 24 caracteres (12 bytes x 2) del string + 2 por el "0x" del inicio, lo que da un total de 26.
      let addressParaCreate2 = ethers.utils.keccak256(unionDePartes).substring(26);

      incluyebadc0de = addressParaCreate2.includes("badc0de");

      if (incluyebadc0de) {
        console.log(`BINGO!!! SE ENCONTRO LA ADDRESS: ${addressParaCreate2} CON EL SALT ${saltEnBytes32}`);
        saltParaCreate2 = saltEnBytes32;
        break;
      }
    }
    expect(incluyebadc0de, "FORMULA NO RETORNO ADDRESS CON badc0de").to.be.true;

    // Salt encontrado 0x0000000000000000000000000000000000000000000000000000000000889424
    //Con ese salt se deploya el contrato FuzzySmarx en la address  0xF5832917475601993261c2644Cbadc0Deff1c4B9
    const txDeploy = await deployerContract.deployDeSmarx(saltParaCreate2);

    await txDeploy.wait();

    addressDeSmarxContract = await deployerContract.addressDondeDeployo();
    console.log(`EL ADDRESS DONDE DEPLOYO SMARX CONTRACT ES: ${addressDeSmarxContract}`);
    //#region Parte no ejecutada en el script por timeout.
    /*
    //Preparación para interactuar con el contrato deployado en la address con "badc0de"
    const smarxFactory = await ethers.getContractFactory("SmarxContract");
    smarxContract = smarxFactory.attach(addressDeSmarxContract);
    
    const txAtacarAuthenticate = await smarxContract.atacarAuthenticate();
    await txAtacarAuthenticate.wait();
    
    //Chequeo si isComplete es true
    let isComplete = await fuzzyChallengeContract.isComplete();
    expect(isComplete, "DESAFIO INCOMPLETO").to.be.true;
    
    */
   //#endregion Parte no ejecutada en el script por timeout.
  })
})