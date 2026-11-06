import { visit } from 'unist-util-visit';
import type { Root, Code } from 'mdast';

export function remarkLangCase() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code) => {
      if (node.lang) {
        let lang = node.lang.trim().toLowerCase();
        if (lang === 'c++') lang = 'cpp';
        if (lang === 'shell') lang = 'bash';
        if (lang === 'tree' || lang === 'text') lang = 'plaintext';
        node.lang = lang;
      }
    });
  };
}

