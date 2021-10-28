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
  <div class="dhealth-chain-information-screen-container">
    <div class="screen-topbar-container">
      <div class="screen-topbar-inner-container">
        <div class="value-container">
          <div class="status-label"><span>Chain Height</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingChainInfo" />
            <span v-else>{{ chainHeight }}</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Finalized</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingChainInfo" />
            <span v-else>{{ finalizedHeight }}</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Importance Grouping</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingChainInfo" />
            <span v-else>in {{ blocksToNextGrouping }} blocks</span>
          </div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Reload</span></div>
          <div class="status-value">
            <ButtonRefresh @click="onClickRefresh" />
          </div>
        </div>
      </div>
    </div> <!-- /.screen-topbar-container -->

    <FormRow class-name="prev-block-hash-container mb0">
      <template v-slot:label>Timestamp:</template>
      <template v-slot:inputs>
        <div class="inputs-container">
          <IconLoading v-if="isLoadingChainInfo" />
          <input v-else
            v-model="lastBlock.block.timestamp"
            class="input-size input-style"
            placeholder="Waiting for last block"
            type="text"
            disabled="disabled"
          />
        </div>
      </template>
    </FormRow>

    <FormRow class-name="last-block-hash-container mt0 mb0">
      <template v-slot:label>Block hash:</template>
      <template v-slot:inputs>
        <div class="inputs-container with-button">
          <IconLoading v-if="isLoadingChainInfo" />
          <div v-else>
            <input
              v-model="lastBlock.meta.hash"
              class="input-size input-style"
              placeholder="Waiting for last block"
              type="text"
              disabled="disabled"
            />
            <ButtonCopy v-model="lastBlock.meta.hash" />
          </div>
        </div>
      </template>
    </FormRow>

    <FormRow class-name="prev-block-hash-container mt0 mb0">
      <template v-slot:label>Prev. hash:</template>
      <template v-slot:inputs>
        <div class="inputs-container with-button">
          <IconLoading v-if="isLoadingChainInfo" />
          <div v-else>
            <input
              v-model="lastBlock.block.previousBlockHash"
              class="input-size input-style"
              placeholder="Waiting for last block"
              type="text"
              disabled="disabled"
            />
            <ButtonCopy v-model="lastBlock.block.previousBlockHash" />
          </div>
        </div>
      </template>
    </FormRow>

    <FormRow class-name="last-block-hash-container mt0 mb0">
      <template v-slot:label>Explorer: </template>
      <template v-slot:inputs>
        <div class="inputs-container">
          <IconLoading v-if="isLoadingChainInfo" />
          <div v-else class="external-links-container">
            <a :href="getExplorerUrl('blocks', chainHeight-4)" target="_blank">#{{chainHeight-4}}</a>
            <span>-</span>
            <a :href="getExplorerUrl('blocks', chainHeight-3)" target="_blank">#{{chainHeight-3}}</a>
            <span>-</span>
            <a :href="getExplorerUrl('blocks', chainHeight-2)" target="_blank">#{{chainHeight-2}}</a>
            <span>-</span>
            <a :href="getExplorerUrl('blocks', chainHeight-1)" target="_blank">#{{chainHeight-1}}</a>
            <span>-</span>
            <a :href="getExplorerUrl('blocks', chainHeight)" target="_blank">#{{chainHeight}}</a>
          </div>
        </div>
      </template>
    </FormRow>

  </div>
</template>

<script lang="ts">
import { BlockInfoDTO, ChainInfoDTO, NetworkConfigurationDTO, NodeInfoDTO } from 'symbol-openapi-typescript-fetch-client';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { ChainService, getNetworkProperty, getNodeNetwork } from '@dhealth/wallet-api-bridge';
import { ButtonCopy, ButtonRefresh, FormRow, IconLoading } from '@dhealth/wallet-components';

@Component({
  components: {
    ButtonCopy,
    ButtonRefresh,
    FormRow,
    IconLoading,
  },
})
export default class ChainInformationScreen extends Vue {
  /**
   * The currently selected node.
   * @var {NodeInfoDTO}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeInfoDTO;

  /**
   * The blockchain information service.
   * @var {ChainService}
   */
  protected chainService: ChainService;

  /**
   * The fetched chain model.
   * @var {ChainInfoDTO}
   */
  protected chainModel: ChainInfoDTO;

  /**
   * The fetched chain model.
   * @var {NetworkConfigurationDTO}
   */
  protected networkConfig: NetworkConfigurationDTO;

  /**
   * The fetched chain model.
   * @var {BlockInfoDTO}
   */
  protected lastBlock: BlockInfoDTO;

  /**
   * Whether the widget is currently loading chain information
   * @var {boolean}
   */
  protected isLoadingChainInfo: boolean = true;

  /**
   * Whether the widget is currently loading the chain visualisation
   * @var {boolean}
   */
  protected isLoadingBlockchain: boolean = true;

  /**
   * The current chain height.
   * @var {number}
   */
  get chainHeight(): number {
    return parseInt(this.chainModel.height);
  }

  /**
   * The current finalized height.
   * @var {number}
   */
  get finalizedHeight(): number {
    return parseInt(this.chainModel.latestFinalizedBlock.height);
  }

  /**
   * The network importance grouping blocks count.
   * @var {number}
   */
  get importanceGrouping(): number {
    return getNetworkProperty(this.networkConfig, 'importanceGrouping');
  }

  /**
   * The next importance grouping
   * @var {number}
   */
  get blocksToNextGrouping(): number {
    const groupingsCount = Math.floor(this.chainHeight / this.importanceGrouping);
    return ((groupingsCount+1) * this.importanceGrouping) - this.chainHeight;
  }

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
   * @async
   */
  async created() {
    await this.refreshData();
  }

  /**
   * Hook called on click of the refresh button.
   *
   * @async
   * @returns {void}
   */
  protected async onClickRefresh() {
    await this.refreshData();
    this.$forceUpdate();
  }

  /**
   * Builds a explorer URL.
   *
   * @param   {string}  submodule
   * @param   {string}  param
   * @returns {string}
   */
  protected getExplorerUrl(
    submodule: string,
    param: string,
  ): string {
    switch (getNodeNetwork(this.nodeModel.networkGenerationHashSeed)) {
      case 'mainnet:dhealth.dhp':
        return `http://explorer.dhealth.cloud/${submodule}/${param}`;
      
      case 'testnet:dhealth.dhp':
        return `https://explorer-01.dhealth.dev:82/${submodule}/${param}`;

      case 'mainnet:symbol.xym':
        return `http://explorer.symbolblockchain.io/${submodule}/${param}`;
    }

    return `http://explorer.dhealth.cloud/${submodule}/${param}`;
  }
  /// end-region components methods

  /// region private api
  /**
   * Private method to refresh data of the component.
   *
   * @async
   * @returns {void}
   */
  private async refreshData() {
    this.chainService = new ChainService();
    const nodeUrl = this.nodeModel.host;
    this.isLoadingChainInfo = true;
    try {
      // fetches basic chain information
      const networkInfo = await this.chainService.getNetworkInfo(nodeUrl);

      // updates component state
      this.chainModel = networkInfo.chain;
      this.networkConfig = networkInfo.config;
      this.lastBlock = networkInfo.block;
      this.isLoadingChainInfo = false;
    }
    catch (e) {
      console.log(e);
    }
  }
  /// end-region private api
}
</script>

<style lang="less" scoped>
@import './ChainInformationScreen.less';
</style>
