import React from "react";
import {ethers} from "ethers";
import {uniqueId} from 'lodash';
import './App.css';
import './bootstrap.min.css';
import TransactionsModal from "./components/TransactionsModal";

const provider = new ethers.providers.Web3Provider(window.ethereum);


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ethBlocks: [],
            openModalIndex: -1,
        };
    }

    componentDidMount() {
        this.getBlockData();
    }

    getBlockData = async () => {
        const blockNumber = await provider.getBlockNumber();

        const ethBlocks = [];
        // get last 10 block
        for (let i = 0; i < 10; i++) {
            const blockData = await provider.getBlock(blockNumber - i);
            ethBlocks.push(blockData);

            this.setState({
                ethBlocks,
            });
        }

        provider.on('block', async (blockNumber) => {
            const blockData = await provider.getBlock(blockNumber);

            // for some reason we got an event right away with a block we already had
            if (ethBlocks[0].number !== blockData.number)
                ethBlocks.unshift(blockData);

            if (this.state.openModalIndex === -1) {
                this.setState({
                    ethBlocks,
                });
            }
        });
    }

    componentWillUnmount() {
        provider.removeAllListeners('block');
    }

    onModalChange = (openModalIndex) => {
        this.setState({
            openModalIndex,
        });
    }

    render() {
        const { ethBlocks, openModalIndex } = this.state;

        return (
            <div className="App">
                <h1 className="mb-5 mt-2">Last 10 Eth Blocks</h1>
                {ethBlocks.map((block, i) => (
                    <div key={uniqueId()} className="mb-4">
                        <div>Block #: {block.number}</div>
                        <div>Hash: {block.hash}</div>
                        <TransactionsModal
                            ethBlockNumber={block.number}
                            isModalOpen={i === openModalIndex}
                            index={i}
                            onModalChange={this.onModalChange}
                        />
                    </div>
                ))}
            </div>
        )
    }
}

export default App;
