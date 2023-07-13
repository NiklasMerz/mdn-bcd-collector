//
// mdn-bcd-collector: lib/tests.ts
// Module for handling the tests for the web app
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import didYouMean from "didyoumean";

import type {Resources} from "../types/types.js";

interface Endpoints {
  [key: string]: string[];
}

class Tests {
  tests: {[key: string]: any};
  resources: Resources;
  endpoints: Endpoints;
  httpOnly: boolean;

  constructor(options) {
    this.tests = options.tests;
    this.resources = options.tests.__resources;
    this.endpoints = this.buildEndpoints();
    this.httpOnly = options.httpOnly;
  }

  buildEndpoints() {
    const endpoints: Endpoints = {
      "": [],
    };

    for (const ident of Object.keys(this.tests)) {
      if (ident === "__resources") {
        continue;
      }
      endpoints[""].push(ident);

      let endpoint = "";
      for (const part of ident.split(".")) {
        endpoint += (endpoint ? "." : "") + part;

        if (!(endpoint in endpoints)) {
          endpoints[endpoint] = [];
        }

        if (!endpoints[endpoint].includes(ident)) {
          endpoints[endpoint].push(ident);
        }
      }
    }

    return endpoints;
  }

  listEndpoints() {
    return Object.keys(this.endpoints);
  }

  didYouMean(input) {
    return didYouMean(input, this.listEndpoints());
  }

  getTests(endpoint, testExposure?, ignoreIdents: string[] = []) {
    if (!(endpoint in this.endpoints)) {
      return [];
    }

    const idents = this.endpoints[endpoint];

    const tests: any[] = [];
    for (const ident of idents) {
      const ignore = ignoreIdents.some((ignoreIdent) => {
        return ident === ignoreIdent || ident.startsWith(`${ignoreIdent}.`);
      });
      if (ignore) {
        continue;
      }
      const test = this.tests[ident];
      for (const exposure of test.exposure) {
        if (!testExposure || exposure == testExposure) {
          tests.push({
            ident,
            // TODO: Simplify this to just a code string.
            tests: [{code: test.code}],
            exposure,
            resources: test.resources || [],
          });
        }
      }
    }

    return tests;
  }
}

export default Tests;
