import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text } from 'mdast';

export function remarkKramdown() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      if (node.children && node.children.length === 1 && node.children[0].type === 'text') {
        const textNode = node.children[0] as Text;
        if (textNode.value.trim() === '{: .line-numbers}' || /^\{:[^}]+\}$/.test(textNode.value.trim())) {
          if (parent && typeof index === 'number') {
            // Remove the Kramdown attribute paragraph node
            parent.children.splice(index, 1);
            return index;
          }
        }
      }
    });
  };
}

