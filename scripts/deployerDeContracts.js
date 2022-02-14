const hre = require("hardhat");

const nombreDelContrato = "V2DosCompletos";

async function main(){
  const deployerFactory = await hre.ethers.getContractFactory(nombreDelContrato);
  deployedContract = await deployerFactory.deploy("0xe50278D6d002e414b72Cca13C62c6222929dC52E","0x189A67FA88FFd01745A80598463B944B3bf69959");
  await deployedContract.deployed();
  
  console.log(`CONTRATO DEPLOYADO EN ADDRESS: ${deployedContract.address}`);  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
