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
    <div class="chain-status-container">
      <div class="chain-status-inner-container">
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
          <div class="status-label"><span>Next Importance Grouping</span></div>
          <div class="status-value">
            <IconLoading v-if="isLoadingChainInfo" />
            <span v-else>{{ nextGrouping }} blocks</span>
          </div>
        </div>
      </div>
    </div> <!-- /.chain-status-container -->

    <FormRow class-name="last-block-hash-container mb0">
      <template v-slot:label>Last block hash:</template>
      <template v-slot:inputs>
        <div class="inputs-container">
          <input
            v-model="nodeModel.publicKey"
            class="input-size input-style"
            placeholder="Waiting for node identity"
            type="text"
            disabled="disabled"
          />
        </div>
      </template>
    </FormRow>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ChainModel, ChainService, IconLoading, NetworkModel, NodeModel } from '@dhealth/wallet-components';

@Component({
  components: {
    IconLoading,
  },
})
export default class ChainInformationScreen extends Vue {
  /**
   * The currently selected node.
   * @var {NodeModel}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeModel;

  /**
   * The blockchain information service.
   * @var {ChainService}
   */
  protected chainService: ChainService;

  /**
   * The fetched chain model.
   * @var {ChainModel}
   */
  protected chainModel: ChainModel;

  /**
   * The fetched network model.
   * @var {NetworkModel}
   */
  protected networkModel: NetworkModel;

  /**
   * The current chain height.
   * @var {number}
   */
  protected chainHeight: number;

  /**
   * The current finalized height.
   * @var {number}
   */
  protected finalizedHeight: number;

  /**
   * The next importance grouping.
   * @var {number}
   */
  protected nextGrouping: number;

  /**
   * Whether the widget is currently loading chain information
   * @var {boolean}
   */
  protected isLoadingChainInfo: boolean = true;

  /**
   * Whether the widget is currently loading block metadata
   * @var {boolean}
   */
  protected isLoadingBlockMeta: boolean = true;

  /// region components methods
  /**
   * Hook called on creation of the Component (render).
   * @async
   */
  async created() {
    this.chainService = new ChainService();
    const nodeUrl = this.nodeModel.host;

    try {
      // fetch basic chain information
      const networkInfo = await this.chainService.getNetworkInfo(nodeUrl);
      console.log("got networkInfo: ", networkInfo);

      this.chainModel = networkInfo.chain;
      this.networkModel = networkInfo.network;
      this.isLoadingChainInfo = false;

      // update component state
      this.chainHeight = this.chainModel.height;
      this.finalizedHeight = this.chainModel.finalizedHeight;

      // computes next grouping
      const groupingsCount = Math.floor(this.chainHeight / this.chainModel.importanceGrouping);
      this.nextGrouping = ((groupingsCount+1) * this.chainModel.importanceGrouping) - this.chainHeight;
    }
    catch (e) {
      console.log(e);
    }
  }
  /// end-region components methods
}
</script>

<style lang="less" scoped>
@import './ChainInformationScreen.less';
</style>
