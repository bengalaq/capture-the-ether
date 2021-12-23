import "@nomiclabs/hardhat-waffle";
import dotenv from "dotenv";
dotenv.config();
const {ARCHIVE_URL, MNEMONIC} = process.env;
import { task, HardhatUserConfig } from "hardhat/config";
import "./tasks/index";

//Example task created by hardhat
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

if (!ARCHIVE_URL)
  throw new Error(
  `ARCHIVE_URL no esta seteado en el archivo .env - Acordate de ingresar la URL del nodo Infura/Alchemy!`
);
if (!MNEMONIC)
  throw new Error(
  `MNEMONIC no esta seteado en el archivo .env - Acordate de ingresar el mnemonic generado por ejemplo, en https://iancoleman.io/bip39/`
);

const accounts = {
// derive accounts from mnemonic, see tasks/create-key
  mnemonic: MNEMONIC,
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      { version: "0.4.21" },
      { version: "0.7.3" },
      { version: "0.8.0" }
    ],
  },
  networks: {
    ropsten: {
      url: ARCHIVE_URL,
      accounts,
    },
    hardhat: {
      accounts, //Sale del mnemonic que creaste por ejemplo en https://iancoleman.io/bip39/
      forking: {
        url: ARCHIVE_URL, // https://eth-ropsten.alchemyapi.io/v2/SECRET
        blockNumber: 11583735 //Recordar actualizar desafío a desafío
      },
    },
  },
  mocha: {
    timeout: 300 * 1e4,
  }
};

export default config;