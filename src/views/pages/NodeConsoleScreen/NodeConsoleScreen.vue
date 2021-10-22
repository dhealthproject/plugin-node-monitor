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
    <p>Placeholder "CONSOLE"!</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { NodeModel } from '@dhealth/wallet-components';

@Component({
  components: {},
})
export default class NodeConsoleScreen extends Vue {
  /**
   * The currently selected node.
   * @var {NodeModel}
   */
  @Prop({ default: undefined })
  public nodeModel: NodeModel;
}
</script>

<style lang="less" scoped>
@import './NodeConsoleScreen.less';
</style>
