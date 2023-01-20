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
    document.location.href = newerVersion.getAttribute('href') as string;
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
};

const amazonHardcover = (): void => {
  class BookInfo {
    isbn13 = 0;
    publishYear = 0;
  }
  const newerVersion = document.querySelector('#newer-version a.a-size-base');
  if (newerVersion) {
    document.location.href = String(newerVersion.getAttribute('href'));
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
  const href = hardcoverElements[0].getAttribute('href') as string;
  if (href.includes('javascript:')) {
    extractBookInfo();
  } else {
    document.location.href = href + '#detailBullets_feature_div';
  }
};

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
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
