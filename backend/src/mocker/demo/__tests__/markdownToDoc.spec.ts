import expect from "expect";
import { markdownToTipTapDoc } from "../markdownToDoc";
import "mocha";

describe("Markdown to Doc", () => {
  it("should convert paragraph", () => {
    expect(markdownToTipTapDoc("Hello")).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: { textAlign: "left" },
          content: [
            {
              type: "text",
              text: "Hello",
            },
          ],
        },
      ],
    });
  });

  it("should convert markdown header to doc", () => {
    expect(markdownToTipTapDoc("# Hello")).toEqual({
      content: [
        {
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Hello",
              type: "text",
            },
          ],
          type: "heading",
        },
      ],
      type: "doc",
    });
  });

  it("should convert markdown list to doc", () => {
    const md = `## hello
- item 1
- item 2
some text
- item 3
1. foo
1. bar`;
    expect(markdownToTipTapDoc(md)).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 2,
          },
          content: [
            {
              type: "text",
              text: "hello",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    {
                      type: "text",
                      text: "item 1",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    {
                      type: "text",
                      text: "item 2",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          attrs: { textAlign: "left" },
          content: [
            {
              type: "text",
              text: "some text",
            },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    {
                      type: "text",
                      text: "item 3",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "orderedList",
          attrs: {
            start: 1,
          },
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    {
                      type: "text",
                      text: "foo",
                    },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  attrs: { textAlign: "left" },
                  content: [
                    {
                      type: "text",
                      text: "bar",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
