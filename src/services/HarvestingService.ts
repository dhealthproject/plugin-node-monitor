/**
 * This file is part of dHealth Wallet API Bridge shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     dHealth Wallet API Bridge
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
// external dependencies
import BigNumber from 'bignumber.js';
import {
  AccountInfoDTO,
  TransactionStatementPageFromJSON,
} from 'symbol-openapi-typescript-fetch-client';
import { getAccountAddress, Filters, HttpService } from '@dhealth/wallet-api-bridge';

/**
 * Harvesting service to handle remote calls
 * about harvesting and accounts.
 * 
 * @export
 * @class {HarvestingService}
 */
export class HarvestingService extends HttpService {
  constructor() {
    super();
  }

  /**
   * Connects to a node by \a nodeUrl and requests
   * transaction statements using receipt endpoint
   * `/statements/transactions` and filtering type
   * with Harvest_Fee (0x2143 or 8515).
   *
   * @param   {string}  nodeUrl   The URL of the node.
   * @param   {string}  address   Address or public key.
   * @returns {Promise<number[]>} A list of block heights.
   */
  public getHarvestedBlocks(
    nodeUrl: string,
    address: string,
  ): Promise<number[]> {
    return new Promise((resolve) => {
      const query = '?'
        + 'receiptType=8515'
        + '&targetAddress=' + address
        + '&order=desc'
        + '&pageSize=100';
      this.__callAPI('get', nodeUrl, '/statements/transaction' + query).then(
        (rawInfo: any) => { 
          const statements = TransactionStatementPageFromJSON(rawInfo);
          return resolve(statements.data.map(s => parseInt(s.statement.height))); 
        }
      );
    });
  }

  /**
   * Calculates the percentage of importance given a raw
   * \a importance score and a raw \a totalChainImportance
   * chain importance. The \a divisibility decimal places
   * are used to format the resulting amount.
   *
   * @params  {BigNumber}   importance
   * @params  {string}      totalChainImportance
   * @params  {number}      divisibility
   * @returns {string}
   */
  public getImportancePercentage(
    importance: BigNumber,
    totalChainImportance: string = "1'000'000'000'000'000",
    divisibility: number = 6,
  ): string {
    // formats total chain importance
    const tci = new BigNumber(Filters.replaceBy(
      totalChainImportance, ['\'']
    ));

    // formula: `(imp / tci) * 100`
    return (importance.dividedBy(tci))
      .multipliedBy(100)
      .toFixed(divisibility);
  }

  /**
   * Sort accounts by importance score and format
   * for table listing by address and importance
   * percentages.
   *
   * @param   {AccountInfoDTO}  harvestersInfo 
   * @returns {{address: string, importance: string}[]}
   */
  public sortAccountsAndFormat(
    harvestersInfo: AccountInfoDTO[]
  ): { address: string, importance: string}[] {
    return harvestersInfo.map(
      h => ({
        address: getAccountAddress(h.account.publicKey),
        importance: new BigNumber(h.account.importance),
      })
    )
    .sort((a, b) => (-1) * a.importance.comparedTo(b.importance)) // -1 = DESC
    .map(h => ({
      ...h,
      importance: this.getImportancePercentage(
        h.importance,
        "1'000'000'000'000'000",
      ),
    }))
  }
}
