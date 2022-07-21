module.exports = {
  checkConnectionState: async (connection, currentPool) => {
    if (
      (!connection ||
        !connection.connection ||
        connection.connection._closing) === true
    ) {
      console.log("Connection is in a closed state, getting a new connection");
      connection.destroy();
      connection = await currentPool.getConnection(async (conn) => conn);
    }
    return connection;
  },
};
