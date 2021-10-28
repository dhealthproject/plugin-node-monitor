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
  <div class="dhealth-plugin-node-monitor-container">
    <div class="dashboard-left-container">
      <FormNodeFinder @submit="onSubmitNode" />

      <hr v-if="hasRequestedNodeInfo" class="separator break" />

      <div v-if="hasRequestedNodeInfo" class="node-details-container">
        <NavigationLinks
          :direction="'horizontal'"
          :items="['Node', 'Chain', 'Harvesting']"
          :current-item-index="activeSubpage"
          @selected="(i) => (activeSubpage = i)"
        />

        <div v-if="activeSubpage === subpageIndexes['node']" class="subpage-field">
          <NodeInformationScreen :node-model="nodeModel" />
        </div>

        <div v-else-if="activeSubpage === subpageIndexes['chain']" class="subpage-field">
          <ChainInformationScreen :node-model="nodeModel" />
        </div>

        <div v-else-if="activeSubpage === subpageIndexes['harvesting']" class="subpage-field">
          <HarvestInformationScreen :node-model="nodeModel" />
        </div>
      </div>
    </div>
    <div class="dashboard-right-container">
      <div class="title">
        <span class="title_txt">{{ 'Plugin details' }}</span>
      </div>
      <p>This plugin lets you input any API node using dHealth to request information about its' status, chain information, and many more.</p>
      <p>Select a node in the form on the left of this screen, then click the Request button. Node information will be displayed below.</p>
      <p>This tool works with any <i>Catapult</i> compatible network which includes: <a href="https://dhealth.network" target="_blank">dHealth Network</a>, <a href="https://dhealth.network" target="_blank">dHealth Test Network</a>, Symbol Platform and Symbol Testnet.</p>

      <a
        class="github-fork-ribbon right-bottom"
        :href="forkUrl"
        target="_blank"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub">Fork me on GitHub</a>
    </div>
  </div>
</template>

<script lang="ts">
import { NodeInfoDTO } from 'symbol-openapi-typescript-fetch-client';
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IconLoading, NavigationLinks } from '@dhealth/wallet-components';

// internal child components
import NodeInformationScreen from '../NodeInformationScreen/NodeInformationScreen.vue';
import ChainInformationScreen from '../ChainInformationScreen/ChainInformationScreen.vue';
import HarvestInformationScreen from '../HarvestInformationScreen/HarvestInformationScreen.vue';
import FormNodeFinder from '../../forms/FormNodeFinder/FormNodeFinder.vue';

@Component({
  components: {
    ChainInformationScreen,
    HarvestInformationScreen,
    FormNodeFinder,
    IconLoading,
    NavigationLinks,
    NodeInformationScreen,
  }
})
export default class NodeMonitor extends Vue {
  /**
   * The plugin fork URL (Github repository).
   * @var {string}
   */
  protected forkUrl: string = 'https://github.com/dhealthproject/plugin-node-monitor';

  /**
   * The currently selected node.
   * @var {NodeInfoDTO}
   */
  protected nodeModel: NodeInfoDTO;

  /**
   * Whether a request has been executed.
   * @var {boolean}
   */
  protected hasRequestedNodeInfo: boolean = false;

  /**
   * List of available subpages.
   * @var {{[k: string]: number}}
   */
  protected subpageIndexes: { [k: string]: number } = {
    node: 0,
    chain: 1,
    harvesting: 2,
    console: 3,
  };

  /**
   * The currently selected subpage.
   * @var {number}
   */
  protected selectedSubpage: number = 0;

  /// region computed properties
  /**
   * Getter for the currently active subpage.
   * @returns {number}
   */
  public get activeSubpage() {
    return this.selectedSubpage;
  }

  /**
   * Setter for the currently active subpage.
   *
   * @param   {number}  index
   * @returns {void}
   */
  public set activeSubpage(index) {
    const numSubpages = Object.keys(this.subpageIndexes).length;
    if (index < 0 || index >= numSubpages) {
      index = 0;
    }

    this.selectedSubpage = index;
  }
  /// end-region computed properties

  /// region component methods
  async created() {
    console.log("NodeMonitor created");
  }

  /**
   * Handler for node finder form.
   *
   * @param   {any}   formItems
   * @returns {void}
   */
  protected onSubmitNode(formItems: any) {
    this.hasRequestedNodeInfo = true;
    this.nodeModel = formItems.nodeModel;
    this.$forceUpdate();
    //XXX if formItems.rememberNode => save node
  }
  /// end-region component methods
}
</script>

<style lang="less" scoped>
@import "./NodeMonitor.less";
@import "./ForkMe.less";
</style>