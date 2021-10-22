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
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    version="1.0"
  >
    <defs id="defs2162">
      <radialGradient id="radialGradient2197" gradientUnits="userSpaceOnUse" cy="15.163" cx="15.891" r="27.545">
        <stop id="stop3145" stop-color="#fff" offset="0"/>
        <stop id="stop3147" stop-color="#00f038" stop-opacity="0" offset="1"/>
      </radialGradient>
      <radialGradient id="radialGradient2199" gradientUnits="userSpaceOnUse" cy="16.847" cx="16.028" gradientTransform="matrix(.91888 .94532 -.71707 .69701 13.381 -10.047)" r="27.545">
        <stop id="stop3179" stop-color="#9bffb3" offset="0"/>
        <stop id="stop3181" stop-color="#00f038" offset="1"/>
      </radialGradient>
    </defs>
    <g id="layer1">
      <g id="g2179" transform="translate(.5 -.5)">
        <path id="path3141" d="m55.091 27.727a27.545 27.545 0 1 1 -55.091 0 27.545 27.545 0 1 1 55.091 0z" fill="url(#radialGradient2197)" transform="matrix(.99849 0 0 .99849 3.9962 4.8147)"/>
        <path id="path2168" stroke-linejoin="round" d="m55.091 27.727a27.545 27.545 0 1 1 -55.091 0 27.545 27.545 0 1 1 55.091 0z" transform="matrix(.99849 0 0 .99849 3.9962 4.8147)" stroke="#00be31" stroke-linecap="round" stroke-width="2.5038" fill="url(#radialGradient2199)"/>
        <path id="path3167" d="m47.25 15.71c-9.325 2.509-17.627 10.014-19.25 19.781-3.925-2.606-7.217-7.955-11.969-8.218-3.137 1.633-10.434 5.866-4.281 8.343 5.505 4.278 13.752 8.131 15.062 15.563 2.69 2.513 6.167-1.059 8.969-2 3.474-5.623-0.428-13.37 2.938-19.344 1.738-5.634 7.82-7.914 11.281-12-0.003-1.483-1.361-2.51-2.75-2.125z" fill="#fff"/>
      </g>
    </g>
  </svg>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class IconSuccess extends Vue {}
</script>

