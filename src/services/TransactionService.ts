/**
 * This file is part of dHealth Wallet API Bridge shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     dHealth Wallet API Bridge
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
// external dependencies
import {
  TransactionInfoDTO,
  TransactionPageFromJSON,
} from 'symbol-openapi-typescript-fetch-client';
import { HttpService } from '@dhealth/wallet-api-bridge';

/**
 * Harvesting service to handle remote calls
 * about blocks and transactions.
 * 
 * @export
 * @class {TransactionService}
 */
export class TransactionService extends HttpService {
  constructor() {
    super();
  }

  /**
   * Connects to a node by \a nodeUrl and requests
   * transactions inside a block using the endpoint
   * at /transactions/confirmed.
   *
   * @param   {string}  nodeUrl   The URL of the node.
   * @param   {number}  height    Block height.
   * @returns {Promise<{hash: string}[]>} A list of transactions hashes.
   */
  public getBlockTransactions(
    nodeUrl: string,
    height: number,
  ): Promise<{hash: string}[]> {
    return new Promise((resolve) => {
      const query = '?'
        + '&height=' + height
        + '&pageSize=100';
      this.__callAPI('get', nodeUrl, '/transactions/confirmed' + query).then(
        (rawInfo: any) => { 
          const transactions = TransactionPageFromJSON(rawInfo);
          return resolve(transactions.data.map(t => ({
            hash: 'hash' in t.meta ? t.meta.hash : t.meta.aggregateHash
          })));
        }
      );
    });
  }
}
