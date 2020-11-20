/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import * as path from 'path';
import * as constants from '../common/constants';
import { IconPathHelper } from '../common/iconHelper';

interface Deferred<T> {
	resolve: (result: T | Promise<T>) => void;
	reject: (reason: any) => void;
}

export abstract class DialogBase {
	protected _toDispose: vscode.Disposable[] = [];
	protected _dialogObject: azdata.window.Dialog;
	protected initDialogComplete: Deferred<void> | undefined;
	protected initDialogPromise: Promise<void> = new Promise<void>((resolve, reject) => this.initDialogComplete = { resolve, reject });
	protected workspaceFormComponent: azdata.FormComponent | undefined;
	protected workspaceInputBox: azdata.InputBoxComponent | undefined;

	constructor(dialogTitle: string, dialogName: string, dialogWidth: azdata.window.DialogWidth = 600) {
		this._dialogObject = azdata.window.createModelViewDialog(dialogTitle, dialogName, dialogWidth);
		this._dialogObject.okButton.label = constants.OkButtonText;
		this.register(this._dialogObject.cancelButton.onClick(() => this.onCancelButtonClicked()));
		this.register(this._dialogObject.okButton.onClick(() => this.onOkButtonClicked()));
		this._dialogObject.registerCloseValidator(async () => {
			return this.validate();
		});
	}

	protected abstract initialize(view: azdata.ModelView): Promise<void>;

	protected async validate(): Promise<boolean> {
		return Promise.resolve(true);
	}

	public async open(): Promise<void> {
		const tab = azdata.window.createTab('');
		tab.registerContent(async (view: azdata.ModelView) => {
			return this.initialize(view);
		});
		this._dialogObject.content = [tab];
		azdata.window.openDialog(this._dialogObject);
		await this.initDialogPromise;
	}

	private onCancelButtonClicked(): void {
		this.dispose();
	}

	private async onOkButtonClicked(): Promise<void> {
		await this.onComplete();
		this.dispose();
	}

	protected async onComplete(): Promise<void> {
	}

	protected dispose(): void {
		this._toDispose.forEach(disposable => disposable.dispose());
	}

	protected register(disposable: vscode.Disposable): void {
		this._toDispose.push(disposable);
	}

	protected showErrorMessage(message: string): void {
		this._dialogObject.message = {
			text: message,
			level: azdata.window.MessageLevel.Error
		};
	}

	protected createHorizontalContainer(view: azdata.ModelView, items: azdata.Component[]): azdata.FlexContainer {
		return view.modelBuilder.flexContainer().withItems(items, { CSSStyles: { 'margin-right': '5px', 'margin-bottom': '10px' } }).withLayout({ flexFlow: 'row', alignItems: 'center' }).component();
	}

	/**
	 * Creates container with information on which workspace the project will be added to and where the workspace will be
	 * created if no workspace is currently open
	 * @param view
	 */
	protected createWorkspaceContainer(view: azdata.ModelView): azdata.FormComponent {
		const workspaceDescription = view.modelBuilder.text().withProperties<azdata.TextComponentProperties>({
			value: vscode.workspace.workspaceFile ? constants.AddProjectToCurrentWorkspace : constants.NewWorkspaceWillBeCreated,
			CSSStyles: { 'margin-top': '3px', 'margin-bottom': '10px' }
		}).component();

		this.workspaceInputBox = view.modelBuilder.inputBox().withProperties<azdata.InputBoxProperties>({
			ariaLabel: constants.WorkspaceLocationTitle,
			width: constants.DefaultInputWidth,
			enabled: !vscode.workspace.workspaceFile?.fsPath, // want it editable if no workspace is open
			value: vscode.workspace.workspaceFile?.fsPath ?? '',
			title: vscode.workspace.workspaceFile?.fsPath ?? '' // hovertext for if file path is too long to be seen in textbox
		}).component();

		const browseFolderButton = view.modelBuilder.button().withProperties<azdata.ButtonProperties>({
			ariaLabel: constants.BrowseButtonText,
			iconPath: IconPathHelper.folder,
			height: '16px',
			width: '18px'
		}).component();
		this.register(browseFolderButton.onDidClick(async () => {
			let fileUri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file(this.workspaceInputBox!.value!),
				filters: {
					'workspace Files': [constants.WorkspaceFileExtension],
				}
			});
			if (!fileUri) {
				return;
			}
			const selectedFile = fileUri.fsPath;
			this.workspaceInputBox!.value = selectedFile;
		}));

		let container: azdata.FlexContainer;

		if (vscode.workspace.workspaceFile) {
			container = view.modelBuilder.flexContainer()
				.withItems([workspaceDescription, this.workspaceInputBox])
				.withLayout({ flexFlow: 'column' })
				.component();
		} else {
			const horizontalContainer = this.createHorizontalContainer(view, [this.workspaceInputBox, browseFolderButton]);
			container = view.modelBuilder.flexContainer()
				.withItems([workspaceDescription, horizontalContainer])
				.withLayout({ flexFlow: 'column' })
				.component();
		}

		this.workspaceFormComponent = {
			title: constants.Workspace,
			component: container,
			required: true
		};

		return this.workspaceFormComponent;
	}

	/**
	 * Update the workspace inputbox based on the passed in location and name if there isn't a workspace currently open
	 * @param location
	 * @param name
	 */
	protected updateWorkspaceInputbox(location: string, name: string): void {
		if (!vscode.workspace.workspaceFile) {
			const fileLocation = location && name ? path.join(location, `${name}.code-workspace`) : '';
			this.workspaceInputBox!.value = fileLocation;
			this.workspaceInputBox!.title = fileLocation;
		}
	}
}
