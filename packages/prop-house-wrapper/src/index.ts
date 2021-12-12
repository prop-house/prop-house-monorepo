import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import axios from "axios";
import { Auction, Proposal, Vote } from "./builders";
import FormData from "form-data";
import fs from 'fs';

export class PropHouseWrapper {

	constructor(
		private readonly signer: Signer | Wallet,
		private readonly host: string
	){}

	async createAuction(auction: Auction) {
		return (await axios.post(`${this.host}/auctions`, auction)).data
	}


	async getAuctions() {
		return (await axios.get(`${this.host}/auctions`)).data
	}

	async createProposal(proposal: Proposal) {
		const signedPayload = await proposal.signedPayload(this.signer)
		return (await axios.post(`${this.host}/proposals`, signedPayload)).data
	}

	async logVote(vote: Vote) {
		const signedPayload = await vote.signedPayload(this.signer)
		return (await axios.post(`${this.host}/votes`, signedPayload)).data
	}

	async postFile(fileBuffer: Buffer, name: string) {
		const form = new FormData();
		form.append('file', fileBuffer, name);
		form.append('name', name);
		const signature = await this.signer.signMessage(fileBuffer);
		form.append('signature', signature)
		console.log(form)
		return (await axios.post(`${this.host}/file`, form, {
			headers: {
				...form.getHeaders()
			}
		}))
	}

	async postFileFromDisk(path: string, name: string) {
		return this.postFile(fs.readFileSync(path), name)
	}


}