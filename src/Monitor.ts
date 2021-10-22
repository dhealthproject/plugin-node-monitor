/**
 * This file is part of dHealth Wallet Plugins shared under LGPL-3.0
 * Copyright (C) 2021 Using Blockchain Ltd, Reg No.: 12658136, United Kingdom
 *
 * @package     dHealth Wallet Plugins
 * @subpackage  NodeMonitor
 * @author      Grégory Saive for Using Blockchain Ltd <greg@ubc.digital>
 * @license     LGPL-3.0
 */
import Vue, { VueConstructor } from "vue";

// vee-validate extension
import { extend } from 'vee-validate';
import { digits, excluded, integer, is, is_not, max_value, max, min_value, min, regex, required } from 'vee-validate/dist/rules';
extend('digits', digits);
extend('excluded', excluded);
extend('integer', integer);
extend('is', is);
extend('is_not', is_not);
extend('max_value', max_value);
extend('max', max);
extend('min_value', min_value);
extend('min', min);
extend('regex', regex);
extend('required', required);

// internal dependencies
// child components
import NodeMonitor from "./views/pages/NodeMonitor/NodeMonitor.vue";

/// region components library
const components: { [s: string]: VueConstructor } = {
  NodeMonitor,
};

export const registerComponents = (): { [s: string]: VueConstructor } => {
  Object.keys(components).forEach((k) => Vue.component(k, components[k]));
  return components;
};
/// end-region components library

/// region installable plugin
export default {
  view: "NodeMonitor",

  routes: [
    {
      path: "/node-monitor",
      name: "nodeMonitor.dashboard",
      meta: {
        protected: true,
        title: "Node Monitor",
        hideFromMenu: true,
      },
      // @ts-ignore
      component: () => import("@/views/pages/NodeMonitor/NodeMonitor.vue"),
      props: false,
    },
  ],

  components,

  storages: [],

  settings: [],

  permissions: [],
};
/// end-region installable plugin
