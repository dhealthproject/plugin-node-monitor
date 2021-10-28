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
  <div class="modal-block-viewer-wrapper">
    <Modal v-model="show" :title="title" :transfer="false" :footer-hide="true">
      <div class="container">
        <div class="body-text">

          <FormRow class-name="block-height-container mt0 mb0">
            <template v-slot:label>Height:</template>
            <template v-slot:inputs>
              <div class="inputs-container with-button">
                <IconLoading v-if="isLoadingBlockInfo" />
                <div v-else>
                  <input
                    v-model="blockInfo.block.height"
                    class="input-size input-style"
                    placeholder="Waiting for block information"
                    type="text"
                    disabled="disabled"
                  />
                </div>
              </div>
            </template>
          </FormRow>

          <FormRow class-name="block-hash-container mt0 mb0">
            <template v-slot:label>Block hash:</template>
            <template v-slot:inputs>
              <div class="inputs-container with-button">
                <IconLoading v-if="isLoadingBlockInfo" />
                <div v-else>
                  <input
                    v-model="blockInfo.meta.hash"
                    class="input-size input-style"
                    placeholder="Waiting for block information"
                    type="text"
                    disabled="disabled"
                  />
                  <ButtonCopy v-model="blockInfo.meta.hash" />
                </div>
              </div>
            </template>
          </FormRow>

          <FormRow class-name="prev-block-hash-container mt0 mb0">
            <template v-slot:label>Prev. hash:</template>
            <template v-slot:inputs>
              <div class="inputs-container with-button">
                <IconLoading v-if="isLoadingBlockInfo" />
                <div v-else>
                  <input
                    v-model="blockInfo.block.previousBlockHash"
                    class="input-size input-style"
                    placeholder="Waiting for block information"
                    type="text"
                    disabled="disabled"
                  />
                  <ButtonCopy v-model="blockInfo.block.previousBlockHash" />
                </div>
              </div>
            </template>
          </FormRow>

          <FormRow class-name="block-hash-container mt0 mb0">
            <template v-slot:label>Harvester:</template>
            <template v-slot:inputs>
              <div class="inputs-container with-button">
                <IconLoading v-if="isLoadingBlockInfo" />
                <div v-else>
                  <input
                    v-model="harvesterAddress"
                    class="input-size input-style"
                    placeholder="Waiting for block information"
                    type="text"
                    disabled="disabled"
                  />
                  <ButtonCopy v-model="harvesterAddress" />
                </div>
              </div>
            </template>
          </FormRow>

          <div class="table-wrapper">
            <GenericTableDisplay
              class="table-section"
              :items="blockTransactions"
              :fields="transactionFields"
              :page-size="5"
              :disable-headers="!blockTransactions || !blockTransactions.length"
              :disable-single-page-links="true"
              :disable-rows-grid="true"
              :disable-placeholder-grid="true"
              :key="transactionsTimestamp"
            >
              <template v-slot:table-title>
                <h1 class="section-title">
                  {{ 'Transactions' }}
                </h1>
              </template>
              <template v-slot:empty>
                <IconLoading v-if="isLoadingBlockData" class="empty-list" />
                <h2 v-else class="empty-list">This block does not contain transactions.</h2>
              </template>
              <template v-slot:rows="props">
                <GenericTableRow
                  v-for="(rowValues, index) in props.items"
                  :key="index"
                  :row-values="rowValues"
                />
              </template>
            </GenericTableDisplay>
          </div>

        </div>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
// external dependencies
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BlockInfoDTO, NodeInfoDTO } from 'symbol-openapi-typescript-fetch-client';
import { getAccountAddress, ChainService } from '@dhealth/wallet-api-bridge';
import { ButtonCopy, GenericTableDisplay, GenericTableRow, FormRow, IconLoading } from '@dhealth/wallet-components';

// internal dependencies
import { TransactionService } from '../../../services/TransactionService';

@Component({
  components: {
    ButtonCopy,
    GenericTableDisplay,
    GenericTableRow,
    FormRow,
    IconLoading,
  }
})
export default class ModalBlockViewer extends Vue {
  /**
   * The currently selected node.
   * @var {NodeInfoDTO}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeInfoDTO;

  /**
   * Modal title
   * @type {string}
   */
  @Prop({ default: '' }) title: string;

  /**
   * Modal visibility state from parent
   * @type {string}
   */
  @Prop({ default: false }) visible: boolean;

  /**
   * Block received
   * @type {BlockInfo}
   */
  @Prop({ default: undefined }) block: number;

  /**
   * Timestamp of the last rendering event.
   * @var {number}
   */
  protected lastRenderTime: number = new Date().valueOf();

  /**
   * The block information DTO.
   * @var {BlockInfoDTO}
   */
  protected blockInfo: BlockInfoDTO;

  /**
   * The harvester address.
   * @var {string}
   */
  protected harvesterAddress: string;

  /**
   * The block information DTO.
   * @var {{hash:string}[]}
   */
  protected blockTransactions: { hash: string }[] = [];

  /**
   * Whether the widget is currently loading block information.
   * @var {boolean}
   */
  protected isLoadingBlockInfo: boolean = true;

  /**
   * Whether the widget is currently loading block data.
   * @var {boolean}
   */
  protected isLoadingBlockData: boolean = true;

  /**
   * Timestamp of the last update of transactions.
   * @var {number}
   */
  protected lastUpdatedTransactions: number = new Date().valueOf();

  /// region computed properties
  /**
   * Internal visibility state
   * @type {boolean}
   */
  public get show(): boolean {
    return this.visible;
  }

  /**
   * Display or hide the modal box.
   *
   * @emits close
   * @param   {boolean}   val
   * @returns {void}
   */
  public set show(val) {
    if (!val) {
      this.$emit('close');
    }
  }

  /**
   * Getter for fields in the harvested blocks table.
   * @return {any[]}
   */
  public get transactionFields(): any[] {
    return [
      { name: 'hash', label: 'Transactions' },
    ];
  }

  /**
   * Getter for timestamp of last update in the harvested blocks table.
   * @return {any[]}
   */
  public get transactionsTimestamp(): number {
    return this.lastUpdatedTransactions;
  }
  /// end-region computed properties

  /// region component methods
  /**
   * Hook called on creation of the Component (render).
   * @async
   */
  public async created() {
    this.lastRenderTime = new Date().valueOf();

    const chain = new ChainService();
    const block = new TransactionService();
    const nodeUrl = this.nodeModel.host;
    try {
      this.blockInfo = await chain.getBlockInfo(nodeUrl, this.block);
      this.harvesterAddress = getAccountAddress(this.blockInfo.block.signerPublicKey);
      this.isLoadingBlockInfo = false;

      this.blockTransactions = (await block.getBlockTransactions(
        nodeUrl,
        this.block,
      )).splice(0, 5);
      this.isLoadingBlockData = false;
      this.lastUpdatedTransactions = new Date().valueOf();
    }
    catch (e) {
      console.log(e);
    }
  }
  /// end-region component methods
}
</script>

<style lang="less" scoped>
@import './ModalBlockViewer.less';
</style>
