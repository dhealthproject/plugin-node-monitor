<!--
/**
 * This file is part of dHealth Wallet Plugins shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     dHealth Wallet Plugins
 * @subpackage  NodeMonitor
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
-->
<template>
  <div class="dhealth-harvester-information-screen-container">
    <div class="screen-topbar-container">
      <div class="screen-topbar-inner-container">
        <div class="value-container">
          <div class="status-label"><span>Harvesters</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingHarvesters" />
            <span v-else>{{ numberOfHarvesters }}</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Total balance</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingTotalBalance" />
            <span v-else>{{ totalHarvestingBalance }}</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Total importance</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingTotalBalance" />
            <span v-else>% {{ totalImportanceScore }}</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Harvesting</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingVotingStatus" />
            <div v-else class="status-icon-container">
              <IconSuccess v-if="harvestingStatus" />
              <IconError v-else>
            </div>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Voting</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingVotingStatus" />
            <div v-else class="status-icon-container">
              <IconSuccess v-if="votingStatus" />
              <IconError v-else>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- /.screen-topbar-container -->

    <div class="screen-main-container">
      <div class="table-wrapper w30">
        <GenericTableDisplay
          class="table-section"
          :items="lastHarvestedBlocks"
          :fields="blockFields"
          :page-size="5"
          :disable-headers="!lastHarvestedBlocks || !lastHarvestedBlocks.length"
          :disable-single-page-links="true"
          :disable-rows-grid="true"
          :disable-placeholder-grid="true"
          :key="harvestedBlocksTimestamp"
        >
          <template v-slot:table-title>
            <h1 class="section-title">
              {{ 'Last harvested blocks' }}
            </h1>
          </template>
          <template v-slot:empty>
            <IconLoading v-if="isLoadingHarvestedBlocks" class="empty-list" />
            <h2 v-else class="empty-list">This node has not harvested blocks yet.</h2>
          </template>
          <template v-slot:rows="props">
            <GenericTableRow
              v-for="(rowValues, index) in props.items"
              :key="index"
              :row-values="rowValues"
              @click="onClickBlock(rowValues.height)"
            />
          </template>
        </GenericTableDisplay>
      </div>
      <div class="table-wrapper p-custom w70">
        <GenericTableDisplay
          class="table-section"
          :items="accountsByImportance"
          :fields="accountFields"
          :page-size="5"
          :disable-headers="!accountsByImportance || !accountsByImportance.length"
          :disable-single-page-links="true"
          :disable-rows-grid="true"
          :disable-placeholder-grid="true"
          :key="accountsByImportanceTimestamp"
        >
          <template v-slot:table-title>
            <h1 class="section-title">
              {{ 'Harvester accounts' }}
            </h1>
          </template>
          <template v-slot:empty>
            <IconLoading v-if="isLoadingTotalBalance" class="empty-list" />
            <h2 v-else class="empty-list">This node does not have harvesters yet.</h2>
          </template>
          <template v-slot:rows="props">
            <GenericTableRow
              v-for="(rowValues, index) in props.items"
              :key="index"
              :row-values="rowValues"
              @click="onClickAccount(rowValues.address)"
            />
          </template>
        </GenericTableDisplay>
      </div>
    </div>

    <ModalBlockViewer
      v-if="showBlockViewerModal"
      :visible="showBlockViewerModal"
      :title="'Block viewer'"
      :block="lastClickedBlock"
      :node-model="nodeModel"
      @close="showBlockViewerModal = false"
    />
  </div>
</template>

<script lang="ts">
const BigNumber = require('bignumber.js');
import { NodeInfoDTO, AccountInfoDTO } from 'symbol-openapi-typescript-fetch-client';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
  AccountService,
  ChainService,
  Filters,
  NetworkIdentifier,
  NodeService,
  NodeType,
  getAccountAddress,
  getAccountBalance,
  getNodeTypes,
} from '@dhealth/wallet-api-bridge';
import { GenericTableDisplay, GenericTableRow, IconLoading } from '@dhealth/wallet-components';

// internal dependencies
import { HarvestingService } from '../../../services/HarvestingService';

// internal child components
import IconSuccess from '../../../components/IconSuccess/IconSuccess.vue';
import IconError from '../../../components/IconError/IconError.vue';
import ModalBlockViewer from '../../modals/ModalBlockViewer/ModalBlockViewer.vue';

@Component({
  components: {
    GenericTableDisplay,
    GenericTableRow,
    IconError,
    IconLoading,
    IconSuccess,
    ModalBlockViewer,
  },
})
export default class HarvestInformationScreen extends Vue {
  /**
   * The currently selected node.
   * @var {NodeInfoDTO}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeInfoDTO;

  /**
   * The service for remote calls.
   * @var {NodeService}
   */
  protected nodeService: NodeService;

  /**
   * The service for remote account calls.
   * @var {AccountService}
   */
  protected accountService: AccountService;

  /**
   * The service for remote calls about the chain.
   * @var {ChainService}
   */
  protected chainService: ChainService;

  /**
   * The service for remote calls about harvesting.
   * @var {HarvestingService}
   */
  protected harvestService: HarvestingService;

  /**
   * The harvesters public keys of the node.
   * @var {number}
   */
  protected harvesterPublicKeys: string[];

  /**
   * The harvesters accounts information.
   * @var {AccountModel[]}
   */
  protected harvestersInfo: AccountInfoDTO[];

  /**
   * The harvester accounts by importance
   * @var {{address: string, importance: string}[]}
   */
  protected accountsByImportance: { address: string, importance: string }[] = [];

  /**
   * The number of harvesters of the node.
   * @var {number}
   */
  protected numberOfHarvesters: number;

  /**
   * The total chain importance (BigNumber).
   * @var {string}
   */
  protected totalChainImportance: string;

  /**
   * The total harvesting balance of the node.
   * @var {number}
   */
  protected totalHarvestingBalance: number;

  /**
   * The total importance score harvesting on the node.
   * @var {number}
   */
  protected totalImportanceScore: string;

  /**
   * The finalization voting status of the node.
   * @var {number}
   */
  protected votingStatus: boolean;

  /**
   * The harvesting status of the node.
   * @var {number}
   */
  protected harvestingStatus: boolean;

  /**
   * The last harvested blocks of the node.
   * @var {{height: number}[]}
   */
  protected lastHarvestedBlocks: { height: number }[] = [];

  /**
   * The height of a block that was clicked.
   * @var {number}
   */
  protected lastClickedBlock: number;

  /**
   * Whether the widget is currently loading harvesters.
   * @var {boolean}
   */
  protected isLoadingHarvesters: boolean = true;

  /**
   * Whether the widget is currently loading total harvesting balance.
   * @var {boolean}
   */
  protected isLoadingTotalBalance: boolean = true;

  /**
   * Whether the widget is currently loading voting status.
   * @var {boolean}
   */
  protected isLoadingVotingStatus: boolean = true;

  /**
   * Whether the widget is currently loading harvested blocks.
   * @var {boolean}
   */
  protected isLoadingHarvestedBlocks: boolean = true;

  /**
   * Whether the widget is currently displaying the block viewer modal.
   * @var {boolean}
   */
  protected showBlockViewerModal: boolean = false;

  /**
   * Timestamp of the last update of harvested blocks.
   * @var {number}
   */
  protected lastUpdatedBlocks: number = new Date().valueOf();

  /**
   * Timestamp of the last update of the total balance.
   * @var {number}
   */
  protected lastUpdatedAccounts: number = new Date().valueOf();

  /// region computed properties
  /**
   * Getter for fields in the harvested blocks table.
   * @return {any[]}
   */
  public get blockFields(): any[] {
    return [
      { name: 'height', label: 'Last harvested blocks' },
    ];
  }

  /**
   * Getter for timestamp of last update in the harvested blocks table.
   * @return {any[]}
   */
  public get harvestedBlocksTimestamp(): number {
    return this.lastUpdatedBlocks;
  }

  /**
   * Getter for fields in the accounts table.
   * @return {any[]}
   */
  public get accountFields(): any[] {
    return [
      { name: 'address', label: 'Top 5 Harvesters' },
      { name: 'importance', label: 'Importance' }
    ];
  }

  /**
   * Getter for timestamp of last update in the accounts table.
   * @return {any[]}
   */
  public get accountByImportanceTimestamp(): number {
    return this.lastUpdatedAccounts;
  }
  /// end-region computed properties

  /**
   * Watcher for the property `nodeModel`. When the selected
   * node changes, data should be refreshed.
   *
   * @returns {void}
   */
  @Watch('nodeModel', { immediate: true })
  protected watchSelectedNode(newValue, oldValue) {
    if (oldValue !== undefined && newValue.nodePublicKey !== oldValue.nodePublicKey) {
      this.refreshData();
    }
  }

  /// region components methods
  /**
   * Hook called on creation of the Component (render).
   *
   * @async
   * @returns {void}
   */
  async created() {
    await this.refreshData();
  }

  /**
   * Hook called on click of a block in the harvested
   * blocks list.
   *
   * @params  {number}    height
   * @returns {void}
   */
  public onClickBlock(height) {
    this.lastClickedBlock = height;
    this.showBlockViewerModal = true;
  }

  /**
   * Hook called on click of an account in the top
   * harvester accounts list.
   *
   * @params  {string}    address
   * @returns {void}
   */
  public onClickAccount(address) {
    console.log("Clicked account: ", address);
  }
  /// end-region components methods

  /// region private api
  /**
   * Retrieves harvesters that have unlocked their account
   * on the currently selected node. This method calls the
   * /node/unlockedaccount endpoint on REST.
   *
   * @returns {void}
   */
  private async fetchHarvesters() {
    const nodeUrl = this.nodeModel.host;
    const roles = getNodeTypes(this.nodeModel.roles);

    this.votingStatus = roles.includes(NodeType.VotingNode);
    this.harvestingStatus = roles.includes(NodeType.PeerNode);
    this.isLoadingVotingStatus = false;

    // fetches basic chain information
    this.harvesterPublicKeys = await this.nodeService.getHarvesters(nodeUrl);
    this.numberOfHarvesters = this.harvesterPublicKeys.length;
  }

  /**
   * Retrieves accounts info for all accounts that harvest
   * on the currently selected node. If a remote account is
   * used for [remote] harvesting, the main account will be
   * queried to find importance and balance.
   *
   * @returns {void}
   */
  private async fetchAccountsInfo() {
    const nodeUrl = this.nodeModel.host;

    // first requests all harvester information
    const accountInfos = await this.accountService.getAccountsInfo(
      nodeUrl,
      this.harvesterPublicKeys,
    );

    // then request linked account if necessary
    // @link https://github.com/dhealthproject/sdk-typescript/blob/dev/src/model/account/AccountType.ts#L27
    const remoteAccts = accountInfos.filter(
      a => a.account.accountType === 2 // 2 = Remote
        && 'linked' in a.account.supplementalPublicKeys
    )

    // next requests all remote information
    const remoteInfos = await this.accountService.getAccountsInfo(
      nodeUrl,
      remoteAccts.map(r => r.account.supplementalPublicKeys.linked.publicKey), // request proxy info
    );

    // merges results (exclude Remote and Unlinked)
    this.harvestersInfo = accountInfos.filter(
      i => !([2, 4].includes(i.account.accountType))
    ).concat(remoteInfos);

    // formats results for accounts table
    this.accountsByImportance = this.harvestService.sortAccountsAndFormat(
      this.harvestersInfo
    )
    .splice(0, 5);
    this.lastUpdatedAccounts = new Date().valueOf();
  }

  /**
   * Computes both the total importance score and total
   * harvesting balance for the currently selected node.
   *
   * @returns {void}
   */
  private async computeTotals() {
    const nodeUrl = this.nodeModel.host;

    // computes total harvesting balance as the sum of all account's balances
    this.totalHarvestingBalance = this.harvestersInfo.reduce(
      (acc, curr) => acc.plus(new BigNumber(
        getAccountBalance(curr.account, '39E0C49FA322A459').amount
      )),
      new BigNumber('0')
    ).shiftedBy(-6); // 6 = divisibility

    // computes total importance as the sum of all account's importances
    // formula: `score / chain_imp * 100`
    this.totalImportanceScore = this.harvestService.getImportancePercentage(
      this.harvestersInfo.reduce(
        (acc, curr) => acc.plus(new BigNumber(curr.account.importance)),
        new BigNumber('0')
      ),
      this.totalChainImportance
    );
  }

  /**
   * Retrieves harvested blocks of the node. This works
   * using the first unlocked account's statements for
   * harvesting fees.
   *
   * @returns {void}
   */
  private async fetchHarvestedBlocks() {
    const nodeUrl = this.nodeModel.host;

    if (! this.harvestersInfo.length) {
      return ;
    }

    // generate address from public key
    const harvester = getAccountAddress(
      this.harvestersInfo[0].account.publicKey,
      NetworkIdentifier.MAIN_NET,
    );

    // fetches basic chain information
    this.lastHarvestedBlocks = (await this.harvestService.getHarvestedBlocks(
      nodeUrl,
      harvester,
    )).map(b => ({ height: b })).splice(0, 5);
    this.lastUpdatedBlocks = new Date().valueOf();
  }

  /**
   * Private method to refresh data of the component.
   *
   * @async
   * @returns {void}
   */
  private async refreshData() {
    this.nodeService = new NodeService();
    this.chainService = new ChainService();
    this.accountService = new AccountService();
    this.harvestService = new HarvestingService();
    const nodeUrl = this.nodeModel.host;
    this.isLoadingHarvesters = true;
    this.isLoadingTotalBalance = true;
    this.isLoadingHarvestedBlocks = true;

    try {
      // fetches /network/properties for totalChainImportance
      const networkProps = await this.chainService.getNetworkConfiguration(nodeUrl);
      this.totalChainImportance = networkProps.chain.totalChainImportance;

      // fetches /node/unlockedaccount
      await this.fetchHarvesters();
      this.isLoadingHarvesters = false;

      // requests all harvester information
      // and requests linked account if necessary
      // (may request up to 2 times POST /accounts)
      await this.fetchAccountsInfo();

      // computes total importance as the sum of all account's importances
      // computes total harvesting balance as the sum of all account's balances
      await this.computeTotals();
      this.isLoadingTotalBalance = false;

      // requests first harvester's statements
      // fetches /statements/transaction
      await this.fetchHarvestedBlocks();
      this.isLoadingHarvestedBlocks = false;
    }
    catch (e) {
      console.log(e);
    }
  }
  /// end-region private api
}
</script>

<style lang="less" scoped>
@import './HarvestInformationScreen.less';
</style>
