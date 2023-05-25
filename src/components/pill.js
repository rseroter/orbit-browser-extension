import { LitElement, html, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";

import tailwindStylesheet from "bundle-text:../styles/tailwind.global.css";

@customElement("obe-pill")
class Pill extends LitElement {
  static get properties() {
    return {
      name: { type: String },
      value: { type: String },
    };
  }

  static styles = [unsafeCSS(tailwindStylesheet)];

  render() {
    return html`
      <div
        class="ring-gray-500/10 inline-flex items-center py-1 px-2 text-xs bg-gray-50 rounded-full ring-1 ring-inset"
      >
        ${this.name &&
        html`<span class="mr-1 font-medium text-gray-600">${this.name}</span>`}
        <span class="font-semibold text-gray-700">${this.value}</span>
      </div>
    `;
  }
}