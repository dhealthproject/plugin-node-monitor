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
  <div class="dhealth-node-information-table-container">
    <div class="node-status-container">
      <div class="node-status-inner-container">
        <div class="value-container">
          <div class="status-label"><span>Friendly name</span></div>
          <div class="status-value"><span>{{ getField('friendlyName') }}</span></div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Version</span></div>
          <div class="status-value"><span>{{ getField('semverVersion') }}</span></div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Hostname</span></div>
          <div class="status-value"><span>{{ getField('host') }}</span></div>
        </div>
        <div class="value-container">
          <div class="status-label"><span>Status</span></div>
          <div class="status-value flex-value">
            <div class="status-subfield">
              <IconLoading v-if="isLoadingNodeHealth" />
              <div v-else class="status-icon-container">
                <IconSuccess v-if="!!nodeHealth && nodeHealth.apiNode && nodeHealth.db" />
                <IconError v-else />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> <!-- /.node-status-container -->

    <FormRow class-name="node-network-container mt0 mb0">
      <template v-slot:inputs>
        <div class="inputs-container">
          <IconLoading v-if="isLoadingNodeHealth" />
          <div v-else class="status-value flex-value">
            <div class="logo-wrapper">
              <SymbolLogo v-if="'mainnet:symbol.xym' === getField('networkDescriptor')" />
              <dHealthLogo v-else-if="'mainnet:dhealth.dhp' === getField('networkDescriptor')" />
            </div>
            <span class="network-name">{{ getNetwork(getField('networkDescriptor')) }}</span>
          </div>
        </div>
      </template>
    </FormRow>

    <FormRow class-name="identity-pubkey-container mb0">
      <template v-slot:label>Public key:</template>
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

    <FormRow class-name="node-pubkey-container mt0 mb0">
      <template v-slot:label>Node key:</template>
      <template v-slot:inputs>
        <div class="inputs-container">
          <input
            v-model="nodeModel.nodePublicKey"
            class="input-size input-style"
            placeholder="Waiting for node public key"
            type="text"
            disabled="disabled"
          />
        </div>
      </template>
    </FormRow>

    <FormRow class-name="node-peers-container mt0 mb0">
      <template v-slot:label>Node peers:</template>
      <template v-slot:inputs>
        <div class="inputs-container">
          <IconLoading v-if="isLoadingNodePeers" />
          <input v-else
            v-model="numberOfPeers"
            class="input-size input-style"
            placeholder="Waiting for peers information"
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
import { FormRow, IconLoading, NodeModel, NodeService, NetworkService } from '@dhealth/wallet-components';

// internal child components
import dHealthLogo from '../../../components/dHealthLogo/dHealthLogo.vue';
import SymbolLogo from '../../../components/SymbolLogo/SymbolLogo.vue';
import IconSuccess from '../../../components/IconSuccess/IconSuccess.vue';
import IconError from '../../../components/IconError/IconError.vue';

@Component({
  components: {
    dHealthLogo,
    FormRow,
    IconError,
    IconLoading,
    IconSuccess,
    SymbolLogo,
  },
})
export default class NodeInformationScreen extends Vue {
  /**
   * The currently selected node.
   * @var {NodeModel}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeModel;

  /**
   * The service for remote calls.
   * @var {NodeService}
   */
  protected nodeService: NodeService;

  /**
   * The number of peers in the neighborhood.
   * @var {number}
   */
  protected numberOfPeers: number;

  /**
   * The current node's peers.
   * @var {NodeModel[]}
   */
  protected peerNodes: NodeModel[];

  /**
   * The current node's health status.
   * @var {{apiNode: boolean, db:boolean}}
   */
  protected nodeHealth: { apiNode: boolean, db: boolean };

  /**
   * Whether the widget is currently loading peers.
   * @var {boolean}
   */
  protected isLoadingNodePeers: boolean = true;

  /**
   * Whether the widget is currently loading health information.
   * @var {boolean}
   */
  protected isLoadingNodeHealth: boolean = true;

  /// region components methods
  /**
   * Hook called on creation of the Component (render).
   * @async
   */
  async created() {
    this.nodeService = new NodeService();
    const nodeUrl = this.nodeModel.host;

    try {
      // fetch node health
      this.nodeHealth = await this.nodeService.getNodeHealth(nodeUrl);
      this.isLoadingNodeHealth = false;

      // fetch peers neighborhood
      this.peerNodes = await this.nodeService.getNodePeers(nodeUrl);
      this.numberOfPeers = this.peerNodes.length;
      this.isLoadingNodePeers = false;
    }
    catch (e) {
      console.log(e);
    }
  }

  /**
   * Read field from node model.
   *
   * @param   {string}  name
   * @returns {string}
   */
  protected getField(name: string) {
    if (!this.nodeModel) {
      return 'Loading...';
    }

    // reads raw string values
    if (name in this.nodeModel && 'string' === typeof this.nodeModel[name]) {
      return this.nodeModel[name];
    }
    // reads raw number values
    else if (name in this.nodeModel && 'number' === typeof this.nodeModel[name]) {
      return this.nodeModel[name];
    }
    // joins array values with comma
    else if (name in this.nodeModel && !!this.nodeModel[name].join) {
      return this.nodeModel[name].join(', ');
    }

    console.log("unrecognized field value: ", this.nodeModel[name]);
    console.log("unrecognized field type: ", typeof this.nodeModel[name]);
    return 'N/A';
  }

  /**
   * Get a network's name by descriptor.
   *
   * @param   {string}  descriptor
   * @returns {string}
   */
  protected getNetwork(descriptor: string): string {
    // in case the network is unknown
    if (! (descriptor in NetworkService.TRUSTED_NETWORKS)) {
      return 'Unknown network';
    }

    // uses @dhealth/wallet-components
    const genHash = NetworkService.TRUSTED_NETWORKS[descriptor];
    return NetworkService.getNetworkName(genHash);
  }
  /// end-region components methods
}
</script>

<style lang="less" scoped>
@import './NodeInformationScreen.less';
</style>
