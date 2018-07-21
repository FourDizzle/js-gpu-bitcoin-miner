
const doesHashPerSecExist = (client) =>
  (client
    && client.progress
    && typeof client.progress.hashPerSecond === 'number')

module.exports = {
  getStats: (clients) => {
    return clients.filter(client => (client && !!client.connected))
      .reduce((val, client) => {
        val.numClients++
        val.totalHashPerSec += doesHashPerSecExist(client) ? client.progress.hashPerSecond : 0
        val.clients.push({
          name: client.name,
          hashPerSec: client.progress.hashPerSecond,
          address: client.address,
        })
        return val;
      }, { numClients: 0, totalHashPerSec: 0, clients: [] });
  }
}
