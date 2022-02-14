pragma solidity ^0.4.21;

import {FuzzyIdentityChallenge} from "./FuzzyIdentity.sol";

interface IName {
    function name() external view returns (bytes32);
}

contract SmarxContract is IName {
  address constant FUZZY_CHALLENGE_ADDRESS= 0xa9371616488eD006dfd48838360d32872BBA6F34;
  
  function SmarxContract() public{}

  function name() external view returns (bytes32){
    return bytes32("smarx");
  }

  function atacarAuthenticate() public{
    FuzzyIdentityChallenge(FUZZY_CHALLENGE_ADDRESS).authenticate();
  }
}