import fs from 'fs';
import { exec } from 'child_process';
import { JsonFragment, JsonFragmentType } from '@ethersproject/abi';

interface SolidityContract {
  name: string;
  source: string;
}

const whitelistedContracts = ['MockERC20', 'MockERC721', 'MockERC1155', 'Vault'];
const test = 'test/ethereum';

const runBlacksmith = () => {
  const cmd = process.argv[2];
  switch (cmd) {
    case 'create': {
      console.log('running :: forge build');
      exec(
        `rm -rf ${test}/blacksmith && mv ${test} _test && forge build --contracts src`,
        (err, stdout, _stderr) => {
          if (stdout) {
            console.log(err || 'success');

            createBlacksmiths();
          } else {
            console.log(err);
            console.log('\x1b[31m%s\x1b[0m', 'build   :: failed badly');
            createBlacksmiths();
          }
          exec(`mv _test ${test}`);
        },
      );
      break;
    }
    case 'clean':
      cleanBlacksmith();
      break;
    case 'build':
      console.log('running :: forge build :: only src');
      exec(`mv ${test} _test && forge build --contracts src --force`, (err, stdout, _stderr) => {
        if (stdout) {
          const nochange = stdout.split('\n')[1]?.indexOf('No files changed') === 0;
          const success = stdout.split('\n')[1]?.indexOf('Compiler run successful') === 0;
          if (success || nochange) {
            console.log('\x1b[32m%s\x1b[0m', 'build   :: completed');
          } else {
            console.log('\x1b[31m%s\x1b[0m', 'build   :: failed');
            console.log(err);
          }
        } else {
          console.log(err);
          console.log('\x1b[31m%s\x1b[0m', 'build   :: failed badly');
        }
        exec(`mv _test ${test}`);
      });
      break;

    default:
      console.log('unknown command');
  }
};

runBlacksmith();

////////////////////////////////////////////////////////////////////////////////

const getABI = ({ name, source }: SolidityContract) => {
  const path = `./out/${source.split('/').slice(-1)[0]}/${name}.json`;
  return JSON.parse(fs.readFileSync(path, 'utf8')).abi;
};

const createFunction = (name: string, fn: JsonFragment) => {
  const fmtType = (type: string) => {
    if (type === 'bytes') return `${type} memory`;
    if (type === 'string') return `${type} memory`;
    if (type.indexOf('struct ') === 0) return `${type.slice(7)} memory`;
    if (type.indexOf('contract ') === 0 && type.indexOf(']') === type.length - 1)
      return `${type.slice(9)} memory`;
    if (type.indexOf('contract ') === 0) return `${type.slice(9)}`;

    if (type.indexOf('enum ') === 0) type = type.slice(5);
    if (type.indexOf(']') === type.length - 1) return `${type} memory`;
    if (type.indexOf(']') === type.length - 3) return `${type} memory`;
    return type;
  };

  const fmtArgs = (args: ReadonlyArray<JsonFragmentType>, withType: boolean, withName: boolean) => {
    const argFmt = args.map((arg, i) => {
      const _type = withType ? fmtType(arg.internalType) : '';
      const _name = withName ? arg.name || `arg${i}` : '';
      return `${_type}${_type && _name ? ' ' : ''}${_name}`;
    });
    return argFmt.join(', ');
  };

  const fmtValue = () => {
    if (fn.stateMutability === 'payable') return '{value: msg.value}';
    return '';
  };

  const fmtPayable = () => {
    if (fn.stateMutability === 'payable') return 'payable ';
    return '';
  };

  const fmtReturn = () => {
    if (fn.outputs!.length === 0) return '';
    return `return `;
  };

  const fmtOutput = () => {
    if (fn.outputs!.length === 0) return '';
    return `returns (${fmtArgs(fn.outputs!, true, false)})`;
  };

  const fmtInput = (withType = true) => {
    return `(${fmtArgs(fn.inputs!, withType, true)})`;
  };

  return `function ${fn.name}${fmtInput()} public ${fmtPayable()} startPrank stop ${fmtOutput()} {
        ${fmtReturn()}${name}(proxiedContract).${fn.name}${fmtValue()}${fmtInput(false)};
    }`;
};

const blacksmithCode = () => {
  return `// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
interface Bsvm {
    function addr(uint256 privateKey) external returns (address addr);
    function deal(address who, uint256 amount) external;
    function startPrank(address sender, address origin) external;
    function prank(address sender, address origin) external;
    function startPrank(address sender) external;
    function stopPrank() external;
    function sign(uint256 privateKey, bytes32 digest)
        external
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        );

}
contract Blacksmith {
    Bsvm constant bsvm = Bsvm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    address _address;
    uint256 privateKey;
    constructor(address _addr, uint256 _privateKey) {
        _address = _privateKey == 0 ? _addr : bsvm.addr(_privateKey);
        privateKey = _privateKey;
    }
    modifier startPrank() {
        bsvm.startPrank(_address, _address);
        _;
    }
    modifier prank() {
        bsvm.prank(_address, _address);
        _;
    }
    modifier stop() {
        _;
        bsvm.stopPrank();
    }
    function addr() external view returns (address) {
        return _address;
    }
    function pkey() external view returns (uint256) {
        return privateKey;
    }
    function deal(uint256 _amount) public {
        bsvm.deal(_address, _amount);
    }
    function call(address _addr, bytes memory _calldata)
        public
        payable
        startPrank
        stop
        returns (bytes memory)
    {
        require(_address.balance >= msg.value, "BS ERROR : Insufficient balance");
        (bool success, bytes memory data) = _addr.call{value: msg.value}(
            _calldata
        );
        require(success, "BS ERROR : Call failed");
        return data;
    }
    function sign(bytes32 _digest)
        external
        returns (
            uint8,
            bytes32,
            bytes32
        )
    {
        require(privateKey != 0, "BS Error : No Private key");
        return bsvm.sign(privateKey, _digest);
    }
    receive() external payable {}
}
`;
};

const createCode = ({ name, source, abi }: SolidityContract & { abi: JsonFragment[] }) => {
  const code = `// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
import "./Blacksmith.sol";
import "../../../src/${source.slice(4)}";
contract ${name}BS {
    Bsvm constant bsvm = Bsvm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);
    address addr;
    uint256 privateKey;
    address payable proxiedContract;

    constructor( address _addr, uint256 _privateKey, address _target) {
        addr = _privateKey == 0 ? _addr : bsvm.addr(_privateKey);
        privateKey = _privateKey;
        proxiedContract = payable(_target);
    }
    modifier prank() {
        bsvm.prank(addr,addr);
        _;
    }
    modifier startPrank() {
        bsvm.startPrank(addr,addr);
        _;
    }
    modifier stop(){
        _;
        bsvm.stopPrank();
    }
    function proxyContract() external view returns (address) {
        return proxiedContract;
    }
    ${abi
      .filter(x => x.type === 'function')
      .map(x => createFunction(name, x))
      .join('\n\n\t')}
}
`;
  return code;
};

const writeFile = ({ name, source }: SolidityContract) => {
  const path = './_test/blacksmith';
  if (!fs.existsSync(path)) fs.mkdirSync(path);
  fs.writeFileSync(`${path}/${name}.bs.sol`, source);
  fs.writeFileSync(`./${path}/Blacksmith.sol`, blacksmithCode());
};

interface SolidityCacheFile {
  artifacts: Record<string, unknown>;
  sourceName: string;
}

const getFiles = () => {
  const cache = JSON.parse(fs.readFileSync('./cache/solidity-files-cache.json', 'utf8'));
  const files = Object.values<SolidityCacheFile>(cache.files);
  let contractPaths: { name: string; source: string }[] = [];
  files.forEach(file => {
    const contracts = Object.keys(file.artifacts);
    contracts
      .filter(c => whitelistedContracts.includes(c))
      .forEach(contract => {
        const dir = file.sourceName.split('/');
        if (dir[0] !== 'src') return;
        if (dir[0] === 'src' && dir[1] === 'test') return;
        contractPaths.push({
          name: contract,
          source: file.sourceName,
        });
      });
  });
  return contractPaths;
};

const createBlacksmiths = () => {
  let files: SolidityContract[];
  try {
    files = getFiles();
    console.log(`found   :: ${files.length} contracts\n`);
  } catch (e) {
    console.log('\x1b[31m%s\x1b[0m', "error   :: couldn't read cache");
    process.exit();
  }
  files.forEach(file => {
    const abi = getABI(file);
    if (abi !== null) {
      const source = createCode({ ...file, abi });
      writeFile({ name: file.name, source });
      console.log(`created :: ${file.name}.bs.sol`);
    }
  });
};

const cleanBlacksmith = () => {
  fs.rmdirSync('./_tests/blacksmith', { recursive: true });
  console.log('\x1b[32m%s\x1b[0m', 'clean   :: completed');
};
