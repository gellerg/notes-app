export const sanitizeHtml = (html: unknown): string => {
  if (typeof html !== 'string') {
    return '';
  }

  try {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(html, 'text/html');

    const allowedTags = new Set([
      'B',
      'I',
      'STRONG',
      'EM',
      'U',
      'P',
      'BR',
      'UL',
      'OL',
      'LI',
      'H1',
      'H2',
      'H3',
      'A',
    ]);

    const cleanNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;

        if (!allowedTags.has(element.tagName)) {
          element.replaceWith(...Array.from(element.childNodes));
          return;
        }

        for (const attribute of Array.from(element.attributes)) {
          const attributeName = attribute.name.toLowerCase();
          const attributeValue = attribute.value.trim().toLowerCase();

          if (attributeName.startsWith('on')) {
            element.removeAttribute(attribute.name);
            continue;
          }

          if (element.tagName === 'A' && attributeName === 'href') {
            if (
              attributeValue.startsWith('javascript:') ||
              attributeValue.startsWith('data:')
            ) {
              element.removeAttribute(attribute.name);
            }

            continue;
          }

          if (!(element.tagName === 'A' && attributeName === 'href')) {
            element.removeAttribute(attribute.name);
          }
        }
      }

      for (const child of Array.from(node.childNodes)) {
        cleanNode(child);
      }
    };

    for (const child of Array.from(parsedDocument.body.childNodes)) {
      cleanNode(child);
    }

    return parsedDocument.body.innerHTML;
  } catch {
    return '';
  }
};