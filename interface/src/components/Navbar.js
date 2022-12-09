import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavLink as Link } from 'react-router-dom';

function Navbar () {
    return (
        <div className="rounded-b-lg flex items-center justify-between w-full h-20 bg-white px-12 border-b-2 border-green-600">
            <Link className="font-semibold text-4xl text-green-600 hover:text-green-500" to='/'>
                XLR-Bridge
            </Link>
            <div className="space-x-40 text-[#121517]">
                <Link className="font-semibold text-lg" to='/'>Bridge</Link>
                <Link className="font-semibold text-lg" to='/pools'>Liquidity</Link>
                {/* <Link className="font-semibold text-lg" to='/stats'>Analytics</Link> */}
            </div>
            <div className="">
                <ConnectButton chainStatus="icon" showBalance={false}/>
            </div>
        </div>
    )
}

export default Navbar;