export function renderNode(parent, render) {
  let node;
  if (typeof parent === "string") {
    node = document.getElementById(parent);
  } else {
    node = parent;
  }

  if (!node) {
    throw Error(`Unable to locate node ${parent}`);
  }

  const newChild = render();

  if (newChild) {
    if (Array.isArray(newChild)) {
      node.replaceChildren(...newChild);
    } else {
      node.replaceChildren(newChild);
    }
  } else {
    node.replaceChildren();
  }
}
