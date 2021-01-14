const axios = require('axios');

const {
  elasticSearch: { getList, getItem, getCount },
  response,
} = require('../helpers');

const { gatewayUrl } = require('../config');

exports.handler = async ({ pathParameters, queryStringParameters }) => {
  try {
    const collection = 'transactions';
    const key = 'txHash';
    const { hash } = pathParameters;
    let query = queryStringParameters;

    const keys = ['sender', 'receiver', 'senderShard', 'receiverShard', 'from', 'size'];

    Object.keys(query).forEach((key) => {
      if (!keys.includes(key)) {
        delete query[key];
      }
    });

    let data;
    let status;

    switch (true) {
      case hash !== undefined && hash === 'count': {
        data = await getCount({ collection, query });
        break;
      }
      case hash !== undefined: {
        try {
          data = await getItem({ collection, key, hash });
        } catch (error) {
          try {
            const {
              data: {
                data: { transaction },
              },
            } = await axios({
              method: 'get',
              url: `${gatewayUrl()}/transaction/${hash}`,
            });

            const {
              gasLimit,
              gasPrice,
              miniblockHash: miniBlockHash,
              nonce,
              receiver,
              sender,
              signature,
              status,
              value,
            } = transaction;

            // TODO: pending alignment
            const receiverShard = null;
            const senderShard = null;

            data = {
              txHash: hash,
              gasLimit,
              gasPrice,
              miniBlockHash,
              nonce,
              receiver,
              receiverShard,
              sender,
              senderShard,
              signature,
              status,
              value,
            };
          } catch (error) {
            status = 404;
          }
        }
        break;
      }
      default: {
        const sort = {
          timestamp: 'desc',
          nonce: 'desc',
        };

        data = await getList({ collection, key, query, sort });
        break;
      }
    }

    return response({ status, data });
  } catch (error) {
    console.error('transactions error', error);
    return response({ status: 503 });
  }
};
