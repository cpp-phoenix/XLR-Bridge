// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";

// A partial ERC20 interface.
interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

interface IHashipool {
    function useLiquidity(uint amount, IERC20 token, address transferTo) external payable;
}

contract XLRCore is AxelarExecutable, Ownable {

    IAxelarGasService immutable gasReceiver;
    IHashipool hashipool;
    mapping(uint32 => bool) public domains;
    mapping(address => bool) public inboxes;
    struct ChainObject {
        uint32 domain;
        address outbox;
    }

    event Executed(address indexed _from, bytes _value);

    constructor(address _gateway, address _gasReceiver, address _hashipool) AxelarExecutable(_gateway) {
        gasReceiver = IAxelarGasService(_gasReceiver);
        hashipool = IHashipool(_hashipool);
    }

    function addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
        return address(uint160(uint256(_buf)));
    }

    // To receive the message from Axelar
    function _execute(
        string calldata,
        string calldata,
        bytes calldata payload
    ) internal override {

        uint amount;
        address multiChainToken;
        address msgSender;

        (amount, multiChainToken, msgSender) = abi.decode(payload,(uint, address, address));
        hashipool.useLiquidity(amount, IERC20(multiChainToken), msgSender);
        
        emit Executed(msg.sender, payload);
    }

    // To send message to Axelar
    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        bytes memory payload
    ) public payable {
        if (msg.value > 0) {
            gasReceiver.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                msg.sender
            );
        }
        gateway.callContract(destinationChain, destinationAddress, payload);
    }

    function initiateBridge(string calldata destinationChain, string calldata destinationAddress, IERC20 multiChainToken, IERC20 sellToken, uint amount) public payable {

        require(sellToken.balanceOf(msg.sender) >= amount, "Insufficient Balance");
        require(sellToken.allowance(msg.sender, address(this)) >= amount, "Not Approved");

        sellToken.transferFrom((msg.sender),address(hashipool), amount);
        
        uint256 boughtAmount = amount;
        bytes memory message = abi.encode(boughtAmount, multiChainToken, msg.sender);

        sendMessage(destinationChain, destinationAddress, message);
    }
}