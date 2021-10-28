import React from "react";
import {ethers} from "ethers";
import {uniqueId} from 'lodash';
import {Modal} from 'react-bootstrap';


const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

class TransactionsModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ethBlock: null,
            ethTransactions: null,
            filterByPersonalAddress: false,
        }
    }

    componentDidMount() {
        const { ethBlockNumber } = this.props;

        provider.getBlockWithTransactions(ethBlockNumber)
            .then(block => {
                const filteredTransactions = block.transactions.filter(transaction => {
                    return transaction.value._hex !== '0x00'
                })

                this.setState({
                    ethBlock: block,
                    // a backup unfiltered copy - we will be doing more filtering than what is above
                    _ethTransactions: filteredTransactions,
                    ethTransactions: filteredTransactions,
                });
            });
    }

    handleShow = () => {
        this.props.onModalChange(this.props.index);
    }

    handleClose = () => {
        this.props.onModalChange(-1);
    }

    applyFilters = async () => {
        const { _ethTransactions, filterByPersonalAddress } = this.state;

        await window.ethereum.enable();
        const address = await signer.getAddress();

        let transactions = _ethTransactions;

        if (filterByPersonalAddress) {
            transactions = transactions.filter(transaction => {
                return transaction.from === address || transaction.to === address;
            });
        }

        this.setState({
            ethTransactions: transactions,
        });
    }

    onPersonalAddressChange = () => {
        this.setState({
            filterByPersonalAddress: !this.state.filterByPersonalAddress,
        });
    }

    render() {
        const { ethTransactions, ethBlock, filterByPersonalAddress } = this.state;
        const { isModalOpen } = this.props;

        return (
            <div className="Modal">
                <button className="btn btn-dark btn-sm" onClick={this.handleShow}>View Block Transactions</button>
                <Modal show={isModalOpen} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Transactions for Block #{ethBlock ? ethBlock.number : ''}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="mb-5 d-flex flex-column">
                            <div className="form-check mb-2">
                                <input className="form-check-input" type="checkbox" value={filterByPersonalAddress} onChange={this.onPersonalAddressChange} />
                                <label className="form-check-label">Filter by my transactions</label>
                            </div>
                            <button className="btn btn-primary btn-sm" onClick={this.applyFilters}>Apply Filters</button>
                        </div>
                        <div>
                            {ethTransactions && ethTransactions.map(transaction => (
                                <div key={uniqueId()} className="mb-4">
                                    <div>Hash: {transaction.hash}</div>
                                    <div>From: {transaction.from}</div>
                                    <div>To: {transaction.to}</div>
                                    <div>Amount (wei): {parseInt(transaction.value._hex, 16)}</div>
                                </div>
                            ))}
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

export default TransactionsModal;