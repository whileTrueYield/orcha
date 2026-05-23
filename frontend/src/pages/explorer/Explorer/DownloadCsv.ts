import { TicketExport } from "types/graphql";
import { format } from "date-fns";

export function downloadCSV(tickets: TicketExport[]) {
  // code splitting papaParse here, to save on the initial bundle size
  import("papaparse").then((Papa) => {
    var csv = Papa.unparse(tickets, {
      columns: [
        "id",
        "local_id",
        "title",
        "description",
        "created_at",
        "status",
        "stage",
        "eta",
        "product",
        "workflow",
        "project",
        "owner_name",
        "owner_email",
        "scheduled_at",
        "closed_at",
        "author_name",
        "author_email",
        "ancestor_tickets",
        "successor_tickets",
        "tags",
      ],
    });

    const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const filename = `tickets-export-orcha-${format(
      new Date(),
      "y-MM-dd-HH-mm-ss"
    )}.csv`;

    let csvURL = null;
    if ((navigator as any).msSaveBlob) {
      csvURL = (navigator as any).msSaveBlob(csvData, filename);
    } else {
      csvURL = window.URL.createObjectURL(csvData);
    }

    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.setAttribute("download", filename);
    tempLink.click();
  });
}
