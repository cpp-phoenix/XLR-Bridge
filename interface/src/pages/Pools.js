import { useNetwork, useAccount, erc20ABI, useProvider, useSigner } from 'wagmi';
import { useEffect, useState } from 'react';
import { ethers, utils } from "ethers";
import { useAlert, positions } from 'react-alert'
import hashipoolabi from "../abis/hashipoolabi.json";

function Pools() {

    const alert = useAlert()

    const chainObj = {
        5: {
            chainId: 5,
            chianName: "Goerli",
            explorer: "https://goerli.etherscan.io/tx/",
            rpc: "https://goerli.infura.io/v3/",
            zeroX: "https://goerli.api.0x.org/",
            receiverContract: "0xf151df49884087a5075143a496a73bdf1e2be6fa",
            hashiPoolContract: "0xA67D503FaC6dA1A41F454D45Bebce7165c09F195",
            domain: 5,
            tokens: [
                {
                    token: "USDT",
                    address: "0x69c9e542c9234a535b25df10e5a0f8542670d44a",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x89a543c56f8fc6249186a608bf91d23310557382",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x0e3b53f09f0e9b3830f7f4a3abd4be7a70713a31",
                    decimals: 18
                }
            ]
        },
        80_001: {
            chainId: 80_001,
            chianName: "Mumbai",
            explorer: "https://mumbai.polygonscan.com/tx/",
            rpc: "https://matic-mumbai.chainstacklabs.com",
            zeroX: "https://mumbai.api.0x.org/",
            receiverContract: "0x32f80437bb4ce60e0ace378c32323b016545213e",
            hashiPoolContract: "0xf151dF49884087A5075143a496a73BDf1e2bE6fA",
            domain: 80001,
            tokens: [
                {
                    token: "USDT",
                    address: "0x07cD0B7fC7979CFd1a76b124F551E981944eFF41",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x4d344098b124fead012fc54b91f3099e1fec06f6",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x8ebf563bc9a267b71b4e6055279d3cf4d3b368ee",
                    decimals: 18
                }
            ]
        },
        1_287: {
            chainId: 1_287,
            chianName: "Moonbase Alpha",
            explorer: "https://moonbase-blockscout.testnet.moonbeam.network/tx/",
            rpc: "https://rpc.testnet.moonbeam.network",
            zeroX: "https://mumbai.api.0x.org/",
            receiverContract: "0x7ff62c41a99dcf968395cc47eaa5014efd9b3a4b",
            hashiPoolContract: "0xd4B71e9D524FB4925c8C3044b45f5FdABbad976e",
            domain: 1287,
            tokens: [
                {
                    token: "USDT",
                    address: "0x14c5f75466f4719d5d405e3ff0b7d181ce8ee1cc",
                    decimals: 18
                },
                {
                    token: "USDC",
                    address: "0x2dEcD02F465E5e60B34598A2E0F2B0a2759377FD",
                    decimals: 18
                },
                {
                    token: "DAI",
                    address: "0x9ad872caba5320ef0ed49a52f69a3d159525f485",
                    decimals: 18
                }
            ]
        }
    }

    const provider = useProvider()
    const { data: signer } = useSigner()
    const { chain, chains } = useNetwork();
    const { isConnected, address } = useAccount();
    const [viewPool, setViewPool] = useState(false);
    const [selectPool, setSelectPool] = useState({});
    const [totalStaked, setTotalStaked] = useState(0);
    const [myStake, setMyStake] = useState(0);
    const [depositAmount, setDepositAmount] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState(0);

    async function checkTotalUserStaked(token) {
        setMyStake(0);
        const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
        let amount = await hashiPoolContract.stableStorage(address, token.address);
        let stakedAmount = ethers.utils.formatUnits(amount.toString(), token.decimals);
        setMyStake(stakedAmount);

        setTotalStaked(0);
        const contract = new ethers.Contract(token.address, erc20ABI, signer);
        amount = await contract.balanceOf(chainObj[chain.id].hashiPoolContract);
        console.log(amount.toString());
        stakedAmount = ethers.utils.formatUnits(amount.toString(), token.decimals);
        setTotalStaked(stakedAmount);
    }

    const triggerDeposit = async () => {
        if(depositAmount > 0) {
            const contract = new ethers.Contract(selectPool.address, erc20ABI, signer);
            const allowed = await contract.allowance(address, chainObj[chain.id].hashiPoolContract);
            let  amount = String(depositAmount * 10 ** selectPool.decimals);
            let txn;
            if(parseInt(allowed.toString(),18) < parseInt(amount,18)) {
                try {
                    txn = await contract.approve(chainObj[chain.id].hashiPoolContract, amount);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            } else {
                const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
                try{
                    txn = await hashiPoolContract.depositInPool(amount, selectPool.address);
                    alert.success(
                        <div>
                            <div>Transaction Sent</div>
                            <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                        </div>, {
                        timeout: 0,
                        position: positions.BOTTOM_RIGHT
                    });
                } catch(ex) {
                    alert.error(<div>Operation failed</div>, {
                        timeout: 3000,
                        position: positions.TOP_RIGHT
                    });
                }
            }
        }
    }

    const triggerWithdraw = async () => {
        if(withdrawAmount > 0) {
            const contract = new ethers.Contract(selectPool.address, erc20ABI, signer);
            const allowed = await contract.allowance(address, chainObj[chain.id].hashiPoolContract);
            let  amount = String(withdrawAmount * 10 ** selectPool.decimals);
            const hashiPoolContract = new ethers.Contract(chainObj[chain.id].hashiPoolContract, hashipoolabi, signer);
            try {
                const txn = await hashiPoolContract.widthdrawFromPool(amount, selectPool.address);
                alert.success(
                    <div>
                        <div>Transaction Sent</div>
                        <button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + txn.hash, "_blank")}>View on explorer</button>
                    </div>, {
                    timeout: 0,
                    position: positions.BOTTOM_RIGHT
                });
            } catch(ex) {
                alert.error(<div>Operation failed</div>, {
                    timeout: 3000,
                    position: positions.TOP_RIGHT
                });
            }
        }
    }   

    return (
        <div className="flex flex-1 items-center justify-center h-5/6">
        {
            viewPool && 
            <div className="absolute flex justify-between flex-col rounded-lg w-4/12 h-content bg-white px-6 py-4 space-y-8">
                <div className="flex w-full items-center justify-center text-2xl mt-2 pb-2 border-b-2">Liquidity</div>
                <div className="flex flex-row space-x-4">
                    <input onChange = {(e) => setDepositAmount(e.target.value)} className="placeholder:text-slate-400 block bg-white w-full py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="Enter Amount to deposit" type="number" name="toAmount"/>       
                    <button onClick={() => triggerDeposit()} className="rounded-lg px-6 py-4 bg-green-600 hover:bg-green-500 text-white">Deposit</button>
                </div>
                <div className="flex flex-row space-x-4">
                    <input onChange = {(e) => setWithdrawAmount(e.target.value)} className="placeholder:text-slate-400 block bg-white w-full py-2 pl-2 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm" placeholder="Enter Amount to withdraw" type="number" name="toAmount"/>       
                    <button onClick={() => triggerWithdraw()} className="rounded-lg px-6 py-4 bg-green-600 hover:bg-green-500 text-white">Withdraw</button>
                </div>
                <div className="flex justify-between h-[100px] font-semibold text-lg items-center border-1 bg-gray-200 rounded-lg px-10">
                    <div>Total Staked: {totalStaked}</div>
                    <div>My Stake: {myStake}</div>
                </div>
                <div onClick={() => setViewPool(!viewPool)} className="rounded-lg flex w-full items-center justify-center text-xl mt-2 py-4 bg-green-700 hover:bg-green-600 text-white hover:cursor-pointer">Close</div>
            </div>
        }
        {
            isConnected && 
            <div className="rounded-lg w-4/12 h-content bg-white">
                {/* <button className='bg-white' onClick={() => { alert.success(<div><div>Transaction Sent</div><button className='text-xs' onClick={()=> window.open(chainObj[chain.id].explorer + "0x36fafaa15e8470a68dcc270816d6ab440195139f9b886c56fe940566a74e6ce6", "_blank")}>View on explorer</button></div>) }}> Show Alert </button> */}
                {chainObj[chain.id].tokens.map(token => <div className="rounded-lg my-1 bg-gray-100 flex items-center text-xl w-full h-[100px] px-4 py-2 hover:bg-gray-200">
                    <div className="flex flex-row items-center justify-between w-full"> 
                        <div> 
                            <div>{token.token}</div>
                        </div>
                        <div className="flex flex-row space-x-6"> 
                            <button onClick={() => {setViewPool(!viewPool); setSelectPool(token); checkTotalUserStaked(token);}} className="rounded-lg bg-green-600 hover:bg-green-500 text-white p-4">Deposit</button>
                            <button onClick={() => {setViewPool(!viewPool); setSelectPool(token); checkTotalUserStaked(token);}} className="rounded-lg bg-green-600 hover:bg-green-500 text-white p-4">Withdraw</button>
                        </div>
                    </div>
                </div>)}
            </div>
        }
        </div>
    )
}
export default Pools;