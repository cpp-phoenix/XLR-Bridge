//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract MessageParser is AxelarExecutable {

    IAxelarGasService immutable gasReceiver;
    string public message = "no data";
    string public sourceChain;

    constructor(address _gateway, address _gasReceiver) AxelarExecutable(_gateway) {
        gasReceiver = IAxelarGasService(_gasReceiver);
    }

    event Executed(address indexed _from, string _value);

    function _execute(
        string calldata sourceChain_,
        string calldata,
        bytes calldata payload
    ) internal override {
        message = abi.decode(payload, (string));
        sourceChain = sourceChain_;
        emit Executed(msg.sender, message);
    }

    function sendMessage(
        string calldata destinationChain,
        string calldata destinationAddress,
        string calldata value_
    ) external payable {
        bytes memory payload = abi.encode(value_);
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

}
