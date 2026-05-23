export const getProjectTemplate = (title: string) => `# ${title}

Use Projects to bridge the gap between new ideas through planning, all the way to their delivery.  

Project pages rely on [Markdown syntax](https://www.markdownguide.org/) with some additional sugar.

## Display a project's content

You may display a project by dragging your mouse hover a title and clicking \`+ project\` button or by using the following Markdown shortcut

\`\`\`md
::project[]
\`\`\`

This will display the following project window:

::project[]

## Add a new ticket

You can create a new ticket from the project window or by dragging your mouse over the title and clicking \`+ ticket\`. 

When adding a ticket, you may create a brand new ticket or reference an existing one.

`;
