/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { HTMLMarkdownConverter } from 'sql/workbench/contrib/notebook/browser/htmlMarkdownConverter';
import * as path from 'vs/base/common/path';
import { URI } from 'vs/base/common/uri';


suite('HTML Markdown Converter', function (): void {
	let htmlMarkdownConverter: HTMLMarkdownConverter;
	let htmlString: string;

	suiteSetup(() => {
		htmlMarkdownConverter = new HTMLMarkdownConverter(URI.file('/tmp/notebook.ipynb'));
		htmlString = '';
	});

	test('Should not alter HTML with no explicit elements', () => {
		htmlString = 'Hello World 123';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'No tags test failed');
	});

	test('Should keep <u> tag intact', () => {
		htmlString = '<u>Hello test</u>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Basic underline test failed');
		htmlString = 'Hello <u>test</u>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Partial underline test failed');
		htmlString = '<p>Hello <u>test</u></p>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Hello <u>test</u>', 'Partial underline paragraph test failed');
		htmlString = '<h1>Hello <u>test</u></h1>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '# Hello <u>test</u>', 'Partial underline h1 test failed');
		htmlString = '<h2>Hello <u>test</u></h2>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '## Hello <u>test</u>', 'Partial underline h2 test failed');
		htmlString = '<h3>Hello <u>test</u></h3>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '### Hello <u>test</u>', 'Partial underline h3 test failed');
	});

	test('Should keep <mark> tag intact', () => {
		htmlString = '<mark>Hello test</mark>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Basic highlight test failed');
		htmlString = 'Hello <mark>test</mark>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Partial highlight test failed');
		htmlString = '<p>Hello <mark>test</mark></p>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Hello <mark>test</mark>', 'Partial highlight paragraph test failed');
		htmlString = '<h1>Hello <mark>test</mark></h1>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '# Hello <mark>test</mark>', 'Partial highlight h1 test failed');
		htmlString = '<h2>Hello <mark>test</mark></h2>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '## Hello <mark>test</mark>', 'Partial highlight h2 test failed');
		htmlString = '<h3>Hello <mark>test</mark></h3>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '### Hello <mark>test</mark>', 'Partial highlight h3 test failed');
	});

	test('Should transform <pre> tag with ```', () => {
		htmlString = '<pre>Hello test</pre>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '```\nHello test\n```', 'Basic pre test failed');
	});

	test('Should transform <span> tag', () => {
		htmlString = '<span>Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Hello test', 'Basic span test failed');
		htmlString = 'Yes<span style="background-color: yellow">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes<mark>Hello test</mark>', 'Basic yellow highlight span failed');
		htmlString = 'Yes<span style="background-color:yellow">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes<mark>Hello test</mark>', 'Basic yellow highlight span no space failed');
		htmlString = 'Yes<span style="font-weight: bold">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes**Hello test**', 'Basic bold span failed');
		htmlString = 'Yes<span style="font-weight:bold">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes**Hello test**', 'Basic bold span no space failed');
		htmlString = 'Yes<span style="font-style: italic">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes_Hello test_', 'Basic italic span failed');
		htmlString = 'Yes<span style="font-style:italic">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes_Hello test_', 'Basic italic span no space failed');
		htmlString = 'Yes<span style="text-decoration-line: underline">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes<u>Hello test</u>', 'Basic underline span failed');
		htmlString = 'Yes<span style="text-decoration-line:underline">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Yes<u>Hello test</u>', 'Basic underline span no space failed');
		htmlString = '<h1>Yes<span style="text-decoration-line:underline; font-style:italic; font-weight:bold; background-color: yellow">Hello test</span></h1>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '# Yes<u>_**<mark>Hello test</mark>**_</u>', 'Compound elements span failed');
		htmlString = '<span style="color: orangered">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with color style should not be altered');
		htmlString = '<span style="font-size: 10.0pt">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with font size style should not be altered');
		htmlString = '<span style="font-size: 10.0pt">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with font size style should not be altered');
		htmlString = '<span style="background-color: green">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with background color (non yellow) style should not be altered');
		htmlString = '<span style="background: green">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with background (non yellow) style should not be altered');
		htmlString = '<span style="line-height: 12.0pt">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with line height style should not be altered');
		htmlString = '<span style="margin-left: 12.0pt">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with margin left style should not be altered');
		htmlString = '<span style="margin-bottom: 12.0pt">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with margin bottom style should not be altered');
		htmlString = '<span style="text-align: center">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), htmlString, 'Span with text align style should not be altered');
		htmlString = '<span style="list-style-type: circle">Hello test</span>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Hello test', 'Span with style that is not included in allowlist should be altered');
	});

	test('Should transform <img> tag', () => {
		htmlString = '<img src="/tmp/stuff.png" alt="stuff">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `![stuff](.${path.sep}stuff.png)`, 'Basic img test failed');
		htmlString = '<img src="/tmp/stuff.png">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `![](.${path.sep}stuff.png)`, 'Basic img test no alt failed');
		htmlString = '<img src="/tmp/my stuff.png">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `![](.${path.sep}my%20stuff.png)`, 'Basic img test no alt space filename failed');
		htmlString = '<img src="/tmp/inner/stuff.png" alt="stuff">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `![stuff](.${path.sep}inner${path.sep}stuff.png)`, 'Basic img test below folder failed');
		htmlString = '<img src="/stuff.png" alt="stuff">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `![stuff](..${path.sep}stuff.png)`, 'Basic img test above folder failed');
		// htmlString = '<img src="e:\\some\\other\\path.png">';
		// assert.equal(htmlMarkdownConverter.convert(htmlString), '![](e:\\some\\other\\path.png)', 'img test different drive failed');
		htmlString = '<img src="https://www.microsoft.com/images/msft.png" alt="msft">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '![msft](https://www.microsoft.com/images/msft.png)', 'Basic https img test failed');
		htmlString = '<img src="http://www.microsoft.com/images/msft.png" alt="msft">';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '![msft](http://www.microsoft.com/images/msft.png)', 'Basic http img test failed');
	});

	test('Should transform <a> tag', () => {
		htmlString = '<a href="/tmp/stuff.png">stuff</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `[stuff](.${path.sep}stuff.png)`, 'Basic link test failed');
		htmlString = '<a href="/tmp/stuff.png"/>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `[](.${path.sep}stuff.png)`, 'Basic link test no label failed');
		htmlString = '<a href="/tmp/my stuff.png"/>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `[](.${path.sep}my%20stuff.png)`, 'Basic link test no label space filename failed');
		htmlString = '<a href="/stuff.png">stuff</a.';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `[stuff](..${path.sep}stuff.png)`, 'Basic link test above folder failed');
		htmlString = '<a href="/tmp/inner/stuff.png">stuff</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `[stuff](.${path.sep}inner${path.sep}stuff.png)`, 'Basic link test below folder failed');
		// htmlString = '<a href="e:\\some\\other\\path.png"/>';
		// assert.equal(htmlMarkdownConverter.convert(htmlString), '[](e:\\some\\other\\path.png)', 'link test different drive failed');
		htmlString = '<a href="https://www.microsoft.com/images/msft.png">msft</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '[msft](https://www.microsoft.com/images/msft.png)', 'Basic https link test failed');
		htmlString = '<a href="http://www.microsoft.com/images/msft.png">msft</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '[msft](http://www.microsoft.com/images/msft.png)', 'Basic http link test failed');
		htmlString = 'Test <a href="http://www.microsoft.com/images/msft.png">msft</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), 'Test [msft](http://www.microsoft.com/images/msft.png)', 'Basic http link + text test failed');
	});

	test('Should transform <li> tags', () => {
		htmlString = '<ul><li>Test</li></ul>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `- Test`, 'Basic unordered list test failed');
		htmlString = '<ul><li>Test</li><li>Test2</li></ul>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `- Test\n- Test2`, 'Basic unordered 2 item list test failed');
		htmlString = '<ul><li>Test<ul><li>Test2</li></ul><li>Test3</li></ul>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `- Test\n    - Test2\n- Test3`, 'Nested item list test failed');
		htmlString = '<ol><li>Test</li></ol>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `1. Test`, 'Basic ordered item test failed');
		htmlString = '<ol><li>Test</li><li>Test2</li></ol>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `1. Test\n2. Test2`, 'Basic ordered item test failed');
		htmlString = '<ol><li>Test<ol><li>Test2</li></ol><li>Test3</li></ol>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `1. Test\n    1. Test2\n2. Test3`, 'Basic ordered item test failed');
	});

	test('Should keep < > tag', () => {
		htmlString = '&lt;test&gt';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<test>', 'Non-HTML tag test failed to escape');
		htmlString = '&lt;test&gt<span style="background:red">message</span>&lt;test&gt';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<test><span style="background:red">message</span><test>', 'Non-HTML tag inside span tag test failed to escape');
		htmlString = '<h1>&lt;test&gt;<h1>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '# \\<test\\>', 'Non-HTML tag inside H1 tag test failed to escape');
		htmlString = '<h2>&lt;test&gt;<h2>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '## \\<test\\>', 'Non-HTML tag inside H2 tag test failed to escape');
		htmlString = '<h3>&lt;test&gt;<h3>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '### \\<test\\>', 'Non-HTML tag inside H3 tag test failed to escape');
		htmlString = '<a href="https://www.microsoft.com/images/msft.png">&lt;msft&gt</a>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '[\\<msft\\>](https://www.microsoft.com/images/msft.png)', 'Non-HTML tag as link test failed to escape');
		htmlString = '<strong>&lt;Bold test&gt;</strong>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '**\\<Bold test\\>**', 'Basic bold non-HTML tag test failed to escape');
		htmlString = '<em>&lt;Italicize test&gt;</em>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '_\\<Italicize test\\>_', 'Basic italicize non-HTML tag test failed to escape');
		htmlString = '<u>&lt;Underline_test&gt;</u> ';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<u>&lt;Underline_test&gt;</u>', 'Basic underline non-HTML tag test failed to escape');
		htmlString = '<ul><li>&lt;test&gt;</li></ul>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '- \\<test\\>', 'Basic unordered list non-HTML tag item test failed to escape');
		htmlString = '<ol><li>&lt;test&gt;</li></ol>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '1. \\<test\\>', 'Basic ordered list non-HTML tag item test failed to escape');
		htmlString = '<mark>&lt;test&gt;</mark>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<mark>&lt;test&gt;</mark>', 'Basic highlighting Non-HTML tag test failed to escape');
		htmlString = '<mark><h1>&lt;test&gt;</h1></mark>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<mark><h1>&lt;test&gt;</h1></mark>', 'Non-HTML tag inside multiple html tags test failed to escape');
		htmlString = '<p>&lt;style&gt</p>';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '\\<style\\>', 'Style tag as a non-HTML tag test failed to escape');
		htmlString = '&lt;test&gt <u>Underlined Text style</u> end';
		assert.equal(htmlMarkdownConverter.convert(htmlString), '<test> <u>Underlined Text style</u> end', 'Non-HTML tag outside with style and underline test failed to escape');

	});

	test('Should transform table with no header', () => {
		htmlString = '<table>\n<thead>\n<tr>\n<th></th>\n<th></th>\n<th></th>\n</tr>\n</thead>\n<tbody><tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n</tbody></table>\n';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `|  |  |  |\n| --- | --- | --- |\n| test | test | test |\n| test | test | test |\n| test | test | test |\n| test | test | test |`, 'Table with no header failed');
	});

	test('Should transform table with missing headings', () => {
		htmlString = '<table>\n<thead>\n<tr>\n<th>Test</th>\n<th></th>\n<th></th>\n</tr>\n</thead>\n<tbody><tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n</tbody></table>\n';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `| Test |  |  |\n| --- | --- | --- |\n| test | test | test |\n| test | test | test |\n| test | test | test |\n| test | test | test |`, 'Table with missing headings failed');
	});

	test('Should transform table with header', () => {
		htmlString = '<table>\n<thead>\n<tr>\n<th>Test</th>\n<th>Test</th>\n<th>Test</th>\n</tr>\n</thead>\n<tbody><tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n<tr>\n<td>test</td>\n<td>test</td>\n<td>test</td>\n</tr>\n</tbody></table>\n';
		assert.equal(htmlMarkdownConverter.convert(htmlString), `| Test | Test | Test |\n| --- | --- | --- |\n| test | test | test |\n| test | test | test |\n| test | test | test |\n| test | test | test |`, 'Table with header failed');
	});
});
