"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const kyoboHardcover = () => {
    class BookInfo {
        constructor() {
            this.isbn13 = 0;
            this.publishYear = 0;
        }
    }
    const aElements = [];
    document.querySelectorAll('a').forEach((v) => aElements.push(v));
    const newerVersion = aElements.find((v) => String(v.textContent).includes('개정판보기'));
    if (newerVersion) {
        document.location.href = newerVersion.getAttribute('href');
    }
    const bookInfo = new BookInfo();
    document.querySelectorAll('tr').forEach((v) => {
        var _a, _b;
        if (String(v.textContent).includes('ISBN')) {
            bookInfo.isbn13 = parseInt(String((_a = v.querySelector('td')) === null || _a === void 0 ? void 0 : _a.textContent).split('(')[0], 10);
        }
        if (String(v.textContent).includes('발행')) {
            bookInfo.publishYear = parseInt(String((_b = v.querySelector('td')) === null || _b === void 0 ? void 0 : _b.textContent).split('년')[0], 10);
        }
    });
    const clipboardValue = `${bookInfo.publishYear}  ${bookInfo.isbn13}`;
    navigator.clipboard.writeText(clipboardValue);
};
const amazonHardcover = () => {
    class BookInfo {
        constructor() {
            this.isbn13 = 0;
            this.publishYear = 0;
        }
    }
    const newerVersion = document.querySelector('#newer-version a.a-size-base');
    if (newerVersion) {
        document.location.href = String(newerVersion.getAttribute('href'));
    }
    const aButtonTexts = [];
    document
        .querySelectorAll('.a-button-text')
        .forEach((v) => aButtonTexts.push(v));
    if (aButtonTexts.length === 0) {
        return;
    }
    const hardcoverElements = [
        ...aButtonTexts.filter((v) => String(v.textContent).includes('Hardcover')),
        ...aButtonTexts.filter((v) => String(v.textContent).includes('Paperback')),
    ];
    const extractBookInfo = () => {
        const bookInfo = new BookInfo();
        document.querySelectorAll('#detailBullets_feature_div li').forEach((v) => {
            const text = String(v.textContent);
            if (text.includes('ISBN-13')) {
                bookInfo.isbn13 = parseInt(text.split(':')[1].replace(/[^0-9]/g, ''), 10);
            }
            if (text.includes('Publisher')) {
                bookInfo.publishYear = parseInt(text.split(',')[1], 10);
            }
        });
        const clipboardValue = `${bookInfo.publishYear}  ${bookInfo.isbn13}`;
        navigator.clipboard.writeText(clipboardValue);
    };
    if (!document.location.href.includes('#detailBullets_feature_div')) {
        document.location.href =
            document.location.href + '#detailBullets_feature_div';
    }
    if (hardcoverElements.length === 0) {
        return;
    }
    if (!hardcoverElements[0].hasAttribute('href')) {
        return;
    }
    const href = hardcoverElements[0].getAttribute('href');
    if (href.includes('javascript:')) {
        extractBookInfo();
    }
    else {
        document.location.href = href + '#detailBullets_feature_div';
    }
};
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if ((_a = changeInfo.url) === null || _a === void 0 ? void 0 : _a.includes('amazon.com')) {
        yield chrome.action.setIcon({
            path: '../images/amazon_16.png',
            tabId: tabId,
        });
        yield chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: amazonHardcover,
        });
    }
    if ((_b = changeInfo.url) === null || _b === void 0 ? void 0 : _b.includes('product.kyobobook.co.kr')) {
        yield chrome.action.setIcon({
            path: '../images/kyobo_16.png',
            tabId: tabId,
        });
        yield chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: kyoboHardcover,
        });
    }
}));
