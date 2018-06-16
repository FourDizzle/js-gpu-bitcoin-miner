// import sha256 from 'js-sha256'

/**
job
  id
  version
  previousBlockHash
  merkleRoot
  timestamp
  bits
  extranonce
  nonceoffset
*/

const getJob = function() {
  return {
    id: '58af8d8c',
    version: '00000002',
    previousBlockHash: '975b9717f7d18ec1f2ad55e2559b5997b8da0e3317c803780000000100000000',
    merkleRoot: '871714dcbae6c8193a2bb9b2a69fe1c0440399f38d94b3a0f1b447275a29978a',
    timestamp: '53058b35',
    bits: '19015f53',
    extranonce: '33087548',
    nonceoffset: 0,
  };
}

module.exports = {
  getJob: getJob,
}
