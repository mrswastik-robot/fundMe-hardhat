const { ethers, network } = require("hardhat")

async function mockKeepers() {
    const raffleAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
    const raffle = await ethers.getContractAt("Raffle" , raffleAddress)
    console.log(`Checking upkeep for ${raffle.address}...`)
    const checkData = ethers.keccak256(ethers.toUtf8Bytes(""))
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await raffle.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
        if ( network.config.chainId == 31337) {
            await mockVrf(requestId, raffle)
        }
    } else {
        console.log("No upkeep needed!")
    }
}

async function mockVrf(requestId, raffle) {
    console.log("We on a local network? Ok let's pretend...")
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address)
    console.log("Responded!")
    const recentWinner = await raffle.getRecentWinner()
    console.log(`The winner is: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })