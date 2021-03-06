/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @publicApi
 */
@Directive({selector: '[ngStyle]'})
export class NgStyle implements DoCheck {
  // TODO(issue/24571): remove '!'.
  private _ngStyle !: {[key: string]: string};
  // TODO(issue/24571): remove '!'.
  private _differ !: KeyValueDiffer<string, string|number>;

  constructor(
      private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer2) {}

  @Input()
  set ngStyle(
      /**
       * A map of style properties, specified as colon-separated
       * key-value pairs.
       * * The key is a style name, with an optional `.<unit>` suffix
       *    (such as 'top.px', 'font-style.em').
       * * The value is an expression to be evaluated.
       */
      values: {[key: string]: string}) {
    this._ngStyle = values;
    if (!this._differ && values) {
      this._differ = this._differs.find(values).create();
    }
  }

  /**
   * Applies the new styles if needed.
   */
  ngDoCheck() {
    if (this._differ) {
      const changes = this._differ.diff(this._ngStyle);
      if (changes) {
        this._applyChanges(changes);
      }
    }
  }

  private _applyChanges(changes: KeyValueChanges<string, string|number>): void {
    changes.forEachRemovedItem((record) => this._setStyle(record.key, null));
    changes.forEachAddedItem((record) => this._setStyle(record.key, record.currentValue));
    changes.forEachChangedItem((record) => this._setStyle(record.key, record.currentValue));
  }

  private _setStyle(nameAndUnit: string, value: string|number|null|undefined): void {
    const [name, unit] = nameAndUnit.split('.');
    value = value != null && unit ? `${value}${unit}` : value;

    if (value != null) {
      this._renderer.setStyle(this._ngEl.nativeElement, name, value as string);
    } else {
      this._renderer.removeStyle(this._ngEl.nativeElement, name);
    }
  }
}
