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
  <div class="nodefinder-form-wrapper">
    <NetworkNodeSelector
      v-model="formItems.nodeModel"
      :with-public-key="true"
      @select="isButtonDisplayed = true"
    />

    <FormRow class-name="remember-node-container mb0">
      <template v-slot:inputs>
        <label>
          <input
            v-model="formItems.rememberNode"
            type="checkbox"
          />
          <span>&nbsp;Remember this node</span>
        </label>
      </template>
    </FormRow>

    <FormRow v-if="isButtonDisplayed" class-name="submit-container mt0 mb0">
      <template v-slot:inputs>
        <div class="align-center">
          <button
            class="button-style inverted-button pl-2 pr-2"
            type="submit"
            :disabled="isButtonDisabled"
            @click="onSubmit"
          >
            {{ 'Request' }}
          </button>
        </div>
      </template>
    </FormRow>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { FormRow, IconLoading, NetworkNodeSelector, NodeModel } from '@dhealth/wallet-components';

@Component({
  components: {
    FormRow,
    IconLoading,
    NetworkNodeSelector,
  },
})
export default class FormNodeFinder extends Vue {
  /**
   * Form fields
   * @var {[key:string]: any}
   */
  protected formItems = {
    nodeModel: { nodePublicKey: '' } as NodeModel,
    rememberNode: false,
  };

  /**
   * Whether the submit button is displayed.
   * @var {boolean}
   */
  protected isButtonDisplayed: boolean = true;

  /**
   * Whether the submit button is disabled.
   * @var {boolean}
   */
  public get isButtonDisabled(): boolean {
    return !this.formItems.nodeModel
      || ! ('nodePublicKey' in this.formItems.nodeModel)
      || !this.formItems.nodeModel.nodePublicKey.length;
  }

  /// region component methods
  /**
   * Submit action forward emitted
   * @return {void}
   */
  public onSubmit() {
    this.isButtonDisplayed = false;
    this.$emit('submit', this.formItems);
  }
  /// end-region component methods
}
</script>

<style lang="less" scoped>
@import './FormNodeFinder.less';
</style>
