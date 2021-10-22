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
  <svg 
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 92.000000 82.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g
      transform="translate(0.000000,82.000000) scale(0.100000,-0.100000)"
      :fill="color"
      stroke="none"
    >
      <path d="M86 753 c-39 -53 -71 -127 -63 -146 3 -7 75 -52 161 -100 l156 -88 0
        -183 c0 -155 2 -186 16 -197 22 -18 172 -24 203 -7 23 13 23 14 25 197 l1 185
        157 90 c144 83 158 93 158 119 0 51 -78 177 -110 177 -10 0 -85 -39 -167 -86
        -81 -48 -152 -87 -158 -87 -5 0 -77 39 -159 87 -82 47 -157 86 -167 86 -11 0
        -34 -21 -53 -47z"
      />
    </g>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class SymbolLogo extends Vue {
  /**
   * Color of the Symbol logo.
   * @type {string}
   */
  @Prop({ default: '#000000' }) color: string;
}
</script>

