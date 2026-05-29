// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@solady/tokens/ERC721.sol";
import {ERC1155} from "@solady/tokens/ERC1155.sol";
import {AssetController} from "./AssetController.sol";

contract Round is ERC721, ERC1155 {
    using AssetController for AssetController.Asset;

    address public house;
    string public title;
    address public manager;

    enum Status { Active, Finalized, Cancelled }
    Status public status;

    uint254 public totalDeposited;
    mapping(address => uint256) public depositTotals;

    struct Proposal {
        address proposer;
        string title;
        string description;
        uint256 createdAt;
        bool executed;
    }

    enum VotingStrategy { OnePerWallet, OnePerToken, Quadratic }
    VotingStrategy public votingStrategy;

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256) public voteCounts;

    event Deposited(address indexed depositor, AssetController.Asset asset);
    event Reclaimed(address indexed claimant, AssetController.Asset asset);
    event Finalized();
    event Cancelled();
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);
    event Voted(uint256 indexed proposalId, address indexed voter);

    modifier onlyManager() {
        require(msg.sender == manager, "NOT_MANAGER");
        _;
    }

    modifier onlyHouseContract() {
        require(msg.sender == house, "NOT_HOUSE");
        _;
    }

    constructor(
        address _house,
        string memory _title,
        address _manager,
        VotingStrategy _votingStrategy
    ) ERC1155("lilrounds://receipt") {
        house = _house;
        title = _title;
        manager = _manager;
        status = Status.Active;
        votingStrategy = _votingStrategy;
    }

    function depositETH() external payable onlyHouseContract {
        require(status == Status.Active, "NOT_ACTIVE");
        require(msg.value > 0, "ZERO_AMOUNT");

        totalDeposited += msg.value;
        depositTotals[msg.sender] += msg.value;

        uint256 receiptId = _getETHReceiptId();
        _mint(msg.sender, receiptId, msg.value);

        emit Deposited(msg.sender, AssetController.Asset(address(0), address(0), msg.value));
    }

    function depositERC20(
        address token,
        uint256 amount
    ) external onlyHouseContract {
        require(status == Status.Active, "NOT_ACTIVE");
        require(amount > 0, "ZERO_AMOUNT");
        require(token != address(0), "INVALID_TOKEN");

        ERC20(token).transferFrom(msg.sender, address(this), amount);

        totalDeposited += amount;
        depositTotals[msg.sender] += amount;

        uint256 receiptId = _getTokenReceiptId(token);
        _mint(msg.sender, receiptId, amount);

        emit Deposited(msg.sender, AssetController.Asset(address(0), token, amount));
    }

    function reclaimETH(uint256 amount) external {
        require(status != Status.Active, "STILL_ACTIVE");
        uint256 receiptId = _getETHReceiptId();
        require(balanceOf(msg.sender, receiptId) >= amount, "INSUFFICIENT_RECEIPTS");

        _burn(msg.sender, receiptId, amount);
        depositTotals[msg.sender] -= amount;
        totalDeposited -= amount;

        payable(msg.sender).transfer(amount);

        emit Reclaimed(msg.sender, AssetController.Asset(address(0), address(0), amount));
    }

    function reclaimERC20(
        address token,
        uint256 amount
    ) external {
        require(status != Status.Active, "STILL_ACTIVE");
        uint256 receiptId = _getTokenReceiptId(token);
        require(balanceOf(msg.sender, receiptId) >= amount, "INSUFFICIENT_RECEIPTS");

        _burn(msg.sender, receiptId, amount);
        depositTotals[msg.sender] -= amount;
        totalDeposited -= amount;

        ERC20(token).transfer(msg.sender, amount);

        emit Reclaimed(msg.sender, AssetController.Asset(address(0), token, amount));
    }

    function createProposal(
        string calldata _title,
        string calldata _description
    ) external onlyHouseContract {
        require(status == Status.Active, "NOT_ACTIVE");

        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            proposer: msg.sender,
            title: _title,
            description: _description,
            createdAt: block.timestamp,
            executed: false
        });

        emit ProposalCreated(proposalId, msg.sender);
    }

    function vote(uint256 proposalId) external {
        require(status == Status.Active, "NOT_ACTIVE");
        require(!hasVoted[proposalId][msg.sender], "ALREADY_VOTED");

        if (votingStrategy == VotingStrategy.OnePerWallet) {
            hasVoted[proposalId][msg.sender] = true;
            voteCounts[proposalId]++;
        } else if (votingStrategy == VotingStrategy.OnePerToken) {
            uint256 tokens = balanceOf(msg.sender, uint160(address(this)));
            require(tokens > 0, "NO_TOKENS");
            hasVoted[proposalId][msg.sender] = true;
            voteCounts[proposalId] += tokens;
        } else if (votingStrategy == VotingStrategy.Quadratic) {
            uint256 tokens = balanceOf(msg.sender, uint160(address(this)));
            require(tokens > 0, "NO_TOKENS");
            hasVoted[proposalId][msg.sender] = true;
            voteCounts[proposalId] += _quadratic(tokens);
        }

        emit Voted(proposalId, msg.sender);
    }

    function getProposal(
        uint256 proposalId
    ) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function finalize() external onlyManager {
        require(status == Status.Active, "NOT_ACTIVE");
        status = Status.Finalized;
        emit Finalized();
    }

    function cancel() external onlyManager {
        require(status == Status.Active, "NOT_ACTIVE");
        status = Status.Cancelled;
        emit Cancelled();
    }

    function transferManagement(address newManager) external onlyManager {
        require(newManager != address(0), "INVALID_MANAGER");
        manager = newManager;
    }

    function _getETHReceiptId() internal pure returns (uint256) {
        return 0;
    }

    function _getTokenReceiptId(address token) internal pure returns (uint256) {
        return uint160(token);
    }

    function _quadratic(uint256 amount) internal pure returns (uint256) {
        return sqrt(amount);
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x > 3) {
            y = x;
            uint256 z = (x + 1) / 2;
            while (z < y) {
                y = z;
                z = (x / z + z) / 2;
            }
        } else if (x != 0) {
            y = 1;
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC1155) returns (bool) {
        return ERC721.supportsInterface(interfaceId) || ERC1155.supportsInterface(interfaceId);
    }
}
