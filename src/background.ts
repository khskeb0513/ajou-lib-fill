const kyoboHardcover = (): void => {
  class BookInfo {
    isbn13 = 0;
    publishYear = 0;
  }

  const aElements: Element[] = [];
  document.querySelectorAll('a').forEach((v) => aElements.push(v));
  const newerVersion = aElements.find((v) =>
    String(v.textContent).includes('개정판보기'),
  );
  if (newerVersion) {
    chrome.runtime.sendMessage('kyobo;개정판 상품으로 이동합니다.');
    document.location.href = newerVersion.getAttribute('href') as string;
    return;
  }
  const bookInfo = new BookInfo();
  document.querySelectorAll('tr').forEach((v) => {
    if (String(v.textContent).includes('ISBN')) {
      bookInfo.isbn13 = parseInt(
        String(v.querySelector('td')?.textContent).split('(')[0],
        10,
      );
    }
    if (String(v.textContent).includes('발행')) {
      bookInfo.publishYear = parseInt(
        String(v.querySelector('td')?.textContent).split('년')[0],
        10,
      );
    }
  });
  const clipboardValue = `${bookInfo.publishYear}\t${bookInfo.isbn13}`;
  navigator.clipboard.writeText(clipboardValue);
  chrome.runtime.sendMessage(`kyobo;${clipboardValue} copied.`);
};

const amazonHardcover = (): void => {
  class BookInfo {
    isbn13 = 0;
    publishYear = 0;
  }

  const newerVersion = document.querySelector('#newer-version a.a-size-base');
  if (newerVersion) {
    chrome.runtime.sendMessage('amazon;개정판 상품으로 이동합니다.');
    document.location.href = String(newerVersion.getAttribute('href'));
    return;
  }
  const aButtonTexts: Element[] = [];
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
        bookInfo.isbn13 = parseInt(
          text.split(':')[1].replace(/[^0-9]/g, ''),
          10,
        );
      }
      if (text.includes('Publisher')) {
        bookInfo.publishYear = parseInt(text.split(',')[1], 10);
      }
    });
    const clipboardValue = `${bookInfo.publishYear}\t${bookInfo.isbn13}`;
    navigator.clipboard.writeText(clipboardValue);
    chrome.runtime.sendMessage(`amazon;${clipboardValue} copied.`);
  };
  if (!document.location.href.includes('#detailBullets_feature_div')) {
    document.location.href =
      document.location.href + '#detailBullets_feature_div';
    return;
  }
  if (hardcoverElements.length === 0) {
    return;
  }
  if (!hardcoverElements[0].hasAttribute('href')) {
    return;
  }
  const href = hardcoverElements[0].getAttribute('href') as string;
  if (href.includes('javascript:')) {
    extractBookInfo();
  } else {
    document.location.href = href + '#detailBullets_feature_div';
    chrome.runtime.sendMessage('amazon;하드커버 상품으로 이동합니다.');
  }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  const enabled = await chrome.storage.local.get('enabled');
  if (enabled['enabled'] !== 'true') {
    chrome.action.setIcon({
      path: '../images/no_fa_icon.png',
    });
    return;
  } else {
    chrome.action.setIcon({
      path: '../icons/16.png',
    });
  }
  if (changeInfo.url?.includes('amazon.com')) {
    await chrome.action.setIcon({
      path: '../images/amazon_16.png',
      tabId: tabId,
    });
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: amazonHardcover,
    });
  }
  if (changeInfo.url?.includes('product.kyobobook.co.kr')) {
    await chrome.action.setIcon({
      path: '../images/kyobo_16.png',
      tabId: tabId,
    });
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: kyoboHardcover,
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  const splitMessages = String(message).split(';');
  switch (splitMessages[0]) {
    case 'amazon':
      chrome.notifications.create({
        message: splitMessages[1],
        iconUrl: '../images/amazon_16.png',
        title: 'amazon detected.',
        type: 'basic',
        eventTime: 2,
      });
      break;
    case 'kyobo':
      chrome.notifications.create({
        message: splitMessages[1],
        iconUrl: '../images/kyobo_16.png',
        title: 'kyobo detected.',
        type: 'basic',
        eventTime: 2,
      });
      break;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('enabled').then((value) => {
    if (Object.keys(value).findIndex((value1) => value1 === 'enabled') === -1) {
      chrome.storage.local.set({
        enabled: 'true',
      });
    }
  });
  chrome.storage.local.get('enabled').then((value) => {
    if (value['enabled'] !== 'true') {
      chrome.action.setIcon({
        path: '../images/no_fa_icon.png',
      });
    } else {
      chrome.action.setIcon({
        path: '../icons/16.png',
      });
    }
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get('enabled').then((value) => {
    if (Object.keys(value).findIndex((value1) => value1 === 'enabled') === -1) {
      chrome.storage.local.set({
        enabled: 'false',
      });
    }
    chrome.action.setIcon({
      path: '../images/no_fa_icon.png',
    });
    return;
  });
  chrome.storage.local.get('enabled').then((value) => {
    if (value['enabled'] !== 'true') {
      chrome.storage.local.set({
        enabled: 'true',
      });
      chrome.action.setIcon({
        path: '../icons/16.png',
      });
    } else {
      chrome.storage.local.set({
        enabled: 'false',
      });
      chrome.action.setIcon({
        path: '../images/no_fa_icon.png',
      });
    }
  });
});
