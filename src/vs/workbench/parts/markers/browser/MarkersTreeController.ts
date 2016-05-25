/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import * as errors from 'vs/base/common/errors';
import mouse = require('vs/base/browser/mouseEvent');
import keyboard = require('vs/base/browser/keyboardEvent');
import actionsrenderer = require('vs/base/parts/tree/browser/actionsRenderer');
import tree = require('vs/base/parts/tree/browser/tree');
import treedefaults = require('vs/base/parts/tree/browser/treeDefaults');
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { CommonKeybindings } from 'vs/base/common/keyCodes';
import { Marker } from 'vs/workbench/parts/markers/common/MarkersModel';
import { IWorkbenchEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IMarker } from 'vs/platform/markers/common/markers';

export class Controller extends treedefaults.DefaultController {

	private contextMenuService:IContextMenuService;
	private actionProvider:actionsrenderer.IActionProvider;

	constructor(actionProvider:actionsrenderer.IActionProvider,
				@IContextMenuService contextMenuService: IContextMenuService,
				@IWorkbenchEditorService private editorService: IWorkbenchEditorService) {
		super({ clickBehavior: treedefaults.ClickBehavior.ON_MOUSE_UP });

		this.actionProvider = actionProvider;
		this.contextMenuService = contextMenuService;

		this.downKeyBindingDispatcher.set(CommonKeybindings.SHIFT_UP_ARROW, this.onUp.bind(this));
		this.downKeyBindingDispatcher.set(CommonKeybindings.SHIFT_DOWN_ARROW, this.onDown.bind(this));
		this.downKeyBindingDispatcher.set(CommonKeybindings.SHIFT_PAGE_UP, this.onPageUp.bind(this));
		this.downKeyBindingDispatcher.set(CommonKeybindings.SHIFT_PAGE_DOWN, this.onPageDown.bind(this));
	}

	protected onLeftClick(tree: tree.ITree, element: any, event: mouse.IMouseEvent): boolean {
		if (this.openFileAtElement(element)) {
			return true;
		}
		return super.onLeftClick(tree, element, event);
	}

	protected onEnter(tree:tree.ITree, event:keyboard.IKeyboardEvent):boolean {
		super.onEnter(tree, event);
		this.openFileAtElement(tree.getFocus());
		return true;
	}

	private openFileAtElement(element: any) {
		if (element instanceof Marker) {
			let marker= <IMarker>element.marker;
			this.editorService.openEditor({
				resource: marker.resource,
				options: {
					selection: {
						startLineNumber: marker.startLineNumber,
						startColumn: marker.startColumn,
						endLineNumber: marker.endLineNumber,
						endColumn: marker.endColumn
					}
				}
			}).done(null, errors.onUnexpectedError);
			return true;
		}
		return false;
	}
}
