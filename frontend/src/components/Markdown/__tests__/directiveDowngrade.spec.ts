/**
 * downgradeUnknownDirectives — the parse-time safeguard that rewrites any
 * directive without a node schema into plain text, so user text like ":happy"
 * (valid remark-directive grammar, no directive intent) degrades instead of
 * crashing Milkdown's parser. Trees are hand-built mdast: the module is
 * deliberately Milkdown-free, so no editor is needed here.
 */
import {
  type MdastNode,
  downgradeUnknownDirectives,
} from "../directiveDowngrade";

function paragraph(...children: MdastNode[]): MdastNode {
  return { type: "paragraph", children };
}

function root(...children: MdastNode[]): MdastNode {
  return { type: "root", children };
}

function text(value: string): MdastNode {
  return { type: "text", value };
}

describe("downgradeUnknownDirectives", () => {
  it("rewrites an unknown inline directive to its literal text", () => {
    const tree = root(
      paragraph(text("an emoji "), {
        type: "textDirective",
        name: "happy",
        children: [],
      }),
    );

    downgradeUnknownDirectives(tree);

    expect(tree.children?.[0].children).toEqual([
      text("an emoji "),
      text(":happy"),
    ]);
  });

  it("keeps the label of an unknown inline directive when it has one", () => {
    const tree = root(
      paragraph({
        type: "textDirective",
        name: "shrug",
        children: [text("oh well")],
      }),
    );

    downgradeUnknownDirectives(tree);

    expect(tree.children?.[0].children).toEqual([text("oh well")]);
  });

  it("leaves mention and emoji inline directives alone", () => {
    const mention: MdastNode = {
      type: "textDirective",
      name: "mention",
      children: [text("Alice")],
    };
    const emoji: MdastNode = {
      type: "textDirective",
      name: "emoji",
      children: [],
    };
    const tree = root(paragraph(mention, emoji));

    downgradeUnknownDirectives(tree);

    expect(tree.children?.[0].children).toEqual([mention, emoji]);
  });

  it("downgrades the legacy inline form of a block embed to its label", () => {
    const tree = root(
      paragraph({
        type: "textDirective",
        name: "ticket",
        children: [text("#10")],
      }),
    );

    downgradeUnknownDirectives(tree);

    expect(tree.children?.[0].children).toEqual([text("#10")]);
  });

  it("rewrites an unknown block directive to a paragraph", () => {
    const tree = root({
      type: "leafDirective",
      name: "youtube",
      children: [],
    });

    downgradeUnknownDirectives(tree);

    expect(tree.children).toEqual([paragraph(text("::youtube"))]);
  });

  it("leaves the ticket and excalidraw block embeds alone", () => {
    const ticket: MdastNode = {
      type: "leafDirective",
      name: "ticket",
      children: [],
    };
    const excalidraw: MdastNode = {
      type: "leafDirective",
      name: "excalidraw",
      children: [text("Wireframe")],
    };
    const tree = root(ticket, excalidraw);

    downgradeUnknownDirectives(tree);

    expect(tree.children).toEqual([ticket, excalidraw]);
  });

  it("unwraps a container directive to its children, downgraded", () => {
    const tree = root({
      type: "containerDirective",
      name: "note",
      children: [
        paragraph(text("inside "), {
          type: "textDirective",
          name: "happy",
          children: [],
        }),
      ],
    });

    downgradeUnknownDirectives(tree);

    expect(tree.children).toEqual([
      paragraph(text("inside "), text(":happy")),
    ]);
  });
});
